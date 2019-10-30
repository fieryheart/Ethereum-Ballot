pragma solidity >=0.4.16 <0.7.0;

import "./ConvertLib.sol";
import "./Ballot.sol";

contract BallotCollection {

    address owner; // 合约的拥有者，管理员
    uint openBallotAmount; // 开放的投票数量
    uint closedBallotAmount; // 关闭的投票数量
    uint ballotID; // 投票数量

    struct User {
        address userAddr; // 用户地址
        bytes32 password; // 用户密码
        address[] ballots;
    }

    struct StatusCode {
        uint Success;
        uint UserExist;
        uint Fail;
        uint FailVoting;
        uint NotUser;
        uint NotPassword;
        uint UserNotExist;
        uint BallotNotExist;
        uint BallotNotClosed;
    }
    /***
    *   200: 请求成功
    *   301: 用户已经注册
    *   400: 请求失败
    *   401: 投票失败
    *   402: 交易发送者与参数地址不一致
    *   403: 登录密码错误
    *   501: 用户没有注册
    *   502: 投票不存在
    *   503: 投票还未关闭
    */
    StatusCode statusCode = StatusCode({
        Success: 200,
        UserExist: 301,
        Fail: 400,
        FailVoting: 401,
        NotUser: 402,
        NotPassword: 403,
        UserNotExist: 501,
        BallotNotExist: 502,
        BallotNotClosed: 503
    });

    mapping(address => User) users;

    address[] usersAddr;
    address[] ballotsAddr;

    modifier onlyOwner() {
        if(msg.sender == owner) _;
    }

    modifier onlyUser() {
        require(isUserAlreadyRegister(msg.sender), "该用户未注册");
        _;
    }

    constructor() public {
        ballotID = 0;
        owner = msg.sender;
    }

    function getOwner() public view returns(address) {
        return owner;
    }

    // 用户注册
    event newUserReturnMessage(uint);
    event newUserReturnMessage(uint, string);
    function newUser(address _userAddr, string memory _password) public returns (uint){
        // 判断是否已经注册
        if(!isUserAlreadyRegister(_userAddr)) {
            users[_userAddr].userAddr = _userAddr;
            users[_userAddr].password = ConvertLib.stringToBytes32(_password);
            usersAddr.push(_userAddr);
            emit newUserReturnMessage(statusCode.Success, "用户注册成功");
            return (statusCode.Success);
        } else {
            emit newUserReturnMessage(statusCode.UserExist);
            return (statusCode.UserExist);
        }
    }

    // 用户登陆
    function toLogin(address _userAddr, string memory _password) public view returns (uint) {
        if(!isUserAlreadyRegister(_userAddr)) return (statusCode.UserNotExist);
        if(msg.sender != _userAddr) return (statusCode.NotUser);
        if(users[_userAddr].password != ConvertLib.stringToBytes32(_password)) return (statusCode.NotPassword);
        return (statusCode.Success);
    }

    event NewBallot(address sender, bool isSuccess, string topic);
    event SendMessage(string);
    event Print(string);
    event Print(address);
    event Print(bool);

    // 创建投票
    event newBallotReturnMessage(uint);
    event newBallotReturnMessage(uint, string);
    function newBallot(string memory _topic, bytes32[] memory _proposal_name) public returns (uint) {
        if(!isUserAlreadyRegister(msg.sender)) {
            emit newBallotReturnMessage(statusCode.UserNotExist);
            return (statusCode.UserNotExist);
        }
        Ballot bl = new Ballot(ballotID, _topic, _proposal_name);
        bl.setBelong(msg.sender);
        users[msg.sender].ballots.push(address(bl));
        ballotsAddr.push(address(bl));
        ballotID = ballotID + 1;
        emit newBallotReturnMessage(statusCode.Success, "创建投票成功");
        return (statusCode.Success);
    }

    // 获取所有的投票地址
    function getAllBallotsAddress() public view returns (uint, address[] memory) {
        address[] memory temp;
        if(!isUserAlreadyRegister(msg.sender)) return (statusCode.UserNotExist, temp);
        return (statusCode.Success, ballotsAddr);
    }

    // 获取投票信息
    function getBallotInfo(address _ballotAddr) public view returns (uint, uint, string memory, address, bytes32[] memory){
        uint ID;
        bytes32[] memory rawProposals; // 选项名
        bool isFind;
        bytes32 topic;
        uint idx;
        address addr;
        if(!isUserAlreadyRegister(msg.sender)) return (statusCode.UserNotExist, ID, ConvertLib.bytes32ToString(topic), addr, rawProposals);
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            (ID, topic, addr, rawProposals) = Ballot(_ballotAddr).getInfo();
            return (statusCode.Success, ID, ConvertLib.bytes32ToString(topic), addr, rawProposals);
        } else {
            return (statusCode.BallotNotExist, ID, ConvertLib.bytes32ToString(topic), addr, rawProposals);
        }
    }

    // 获取投票数量
    function getBallotVote(address _ballotAddr) public view returns (uint, bytes32[] memory, uint[] memory) {
        bool isFind;
        uint idx;
        bytes32[] memory names;
        uint[] memory voteCounts;
        if(!isUserAlreadyRegister(msg.sender)) return (statusCode.UserNotExist, names, voteCounts);
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            (names, voteCounts) = Ballot(_ballotAddr).getVote();
            return (statusCode.Success, names, voteCounts);
        } else {
            return (statusCode.BallotNotExist, names, voteCounts);
        }
    }

    // 显示投票状态
    function getBallotStatus(address _ballotAddr) public view returns (uint, bool) {
        bool isFind;
        uint idx;
        if(!isUserAlreadyRegister(msg.sender)) return (statusCode.UserNotExist, false);
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            return (statusCode.Success, Ballot(_ballotAddr).getClosed());
        } else {
            return (statusCode.BallotNotExist, false);
        }
    }

    // 获取赢家
    function getBallotWinner(address _ballotAddr) public onlyUser returns (uint, bytes32[] memory) {
        bool isFind;
        uint idx;
        bytes32[] memory names;
        if(!isUserAlreadyRegister(msg.sender)) return (statusCode.UserNotExist, names);
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            if(!Ballot(_ballotAddr).getClosed()) return (statusCode.BallotNotClosed, names);
            else return (statusCode.Success, Ballot(_ballotAddr).getWinner());
        } else {
            return (statusCode.BallotNotExist, names);
        }
    }

    // 设置标题
    event setBallotTopicReturnMessage(uint);
    event setBallotTopicReturnMessage(uint, string);
    function setBallotTopic(address _ballotAddr, string memory _to_topic) public returns (uint) {
        bool isFind;
        uint idx;
        if(!isUserAlreadyRegister(msg.sender)) {
            emit setBallotTopicReturnMessage(statusCode.UserNotExist);
            return (statusCode.UserNotExist);
        }
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            if(Ballot(_ballotAddr).getBelong() != msg.sender) {
                emit setBallotTopicReturnMessage(statusCode.NotUser, "非本投票拥有者");
                return (statusCode.NotUser);
            }
            Ballot(_ballotAddr).setTopic(ConvertLib.stringToBytes32(_to_topic));
            emit setBallotTopicReturnMessage(statusCode.Success, "设置标题成功");
            return (statusCode.Success);
        } else {
            emit setBallotTopicReturnMessage(statusCode.BallotNotExist, "设置标题失败");
            return (statusCode.BallotNotExist);
        }
    }

    // 增加投票项
    event addBallotProposalReturnMessage(uint);
    event addBallotProposalReturnMessage(uint, string);
    function addBallotProposal(address _ballotAddr, string memory _name) public returns (uint) {
        bool isFind;
        uint idx;
        if(!isUserAlreadyRegister(msg.sender)) {
            emit addBallotProposalReturnMessage(statusCode.UserNotExist);
            return (statusCode.UserNotExist);
        }
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            if(Ballot(_ballotAddr).getBelong() != msg.sender) {
                emit setBallotTopicReturnMessage(statusCode.NotUser, "非本投票拥有者");
                return (statusCode.NotUser);
            }
            Ballot(_ballotAddr).addProposal(ConvertLib.stringToBytes32(_name));
            emit addBallotProposalReturnMessage(statusCode.Success, "增加投票项成功");
            return (statusCode.Success);
        } else {
            emit addBallotProposalReturnMessage(statusCode.BallotNotExist, "增加投票项失败");
            return (statusCode.BallotNotExist);
        }
    }

    // 删除投票项
    event deleteBallotProposalReturnMessage(uint);
    event deleteBallotProposalReturnMessage(uint, string);
    function deleteBallotProposal(address _ballotAddr, string memory _name) public returns (uint) {
        bool isFind;
        uint idx;
        if(!isUserAlreadyRegister(msg.sender)) {
            emit deleteBallotProposalReturnMessage(statusCode.UserNotExist);
            return (statusCode.UserNotExist);
        }
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            if(Ballot(_ballotAddr).getBelong() != msg.sender) {
                emit deleteBallotProposalReturnMessage(statusCode.NotUser, "非本投票拥有者");
                return (statusCode.NotUser);
            }
            Ballot(_ballotAddr).deleteProposal(ConvertLib.stringToBytes32(_name));
            emit deleteBallotProposalReturnMessage(statusCode.Success, "删除投票项成功");
            return (statusCode.Success);
        } else {
            emit deleteBallotProposalReturnMessage(statusCode.BallotNotExist, "删除投票项成功");
            return (statusCode.BallotNotExist);
        }
    }

    // 设置投票状态
    event setBallotStatusReturnMessage(uint);
    event setBallotStatusReturnMessage(uint, string);
    function setBallotStatus(address _ballotAddr, bool status) public returns (uint) {
        bool isFind;
        uint idx;
        if(!isUserAlreadyRegister(msg.sender)) {
            emit setBallotStatusReturnMessage(statusCode.UserNotExist);
            return (statusCode.UserNotExist);
        }
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            if(Ballot(_ballotAddr).getBelong() != msg.sender) {
                emit setBallotStatusReturnMessage(statusCode.NotUser, "非本投票拥有者");
                return (statusCode.NotUser);
            }
            if(status) {
                Ballot(users[msg.sender].ballots[idx]).closing(msg.sender);
            } else {
                Ballot(users[msg.sender].ballots[idx]).opening(msg.sender);
            }
            emit setBallotStatusReturnMessage(statusCode.Success, "设置投票状态成功");
            return (statusCode.Success);
        } else {
            emit setBallotStatusReturnMessage(statusCode.BallotNotExist, "设置投票状态失败");
            return (statusCode.BallotNotExist);
        }
    }

    // 投票
    event votingBallotReturnMessage(uint);
    event votingBallotReturnMessage(uint, string);
    function votingBallot(address _ballotAddr, string memory _name) public returns (uint) {
        bool isFind;
        uint idx;
        if(!isUserAlreadyRegister(msg.sender)) {
            emit setBallotStatusReturnMessage(statusCode.UserNotExist);
            return (statusCode.UserNotExist);
        }
        (isFind, idx) = findBallot(_ballotAddr);
        if(isFind) {
            bool status;
            string memory message;
            (status, message) = Ballot(_ballotAddr).voting(msg.sender, ConvertLib.stringToBytes32(_name));
            if(status) {
                emit votingBallotReturnMessage(statusCode.FailVoting, message);
                return (statusCode.FailVoting);
            } else {
                emit votingBallotReturnMessage(statusCode.Success, message);
                return (statusCode.Success);
            }
        } else {
            emit votingBallotReturnMessage(statusCode.BallotNotExist, "投票失败");
            return (statusCode.BallotNotExist);
        }
    }

    // 判断一个用户是否已经注册
    function isUserAlreadyRegister(address _userAddr) internal view returns (bool)  {
        for (uint i = 0; i < usersAddr.length; i++) {
            if (usersAddr[i] == _userAddr) {
                return true;
            }
        }
        return false;
    }

    function findBallot(address _ballotAddr) internal view returns (bool, uint) {
        for(uint i = 0; i < ballotsAddr.length; i++) {
            if(ballotsAddr[i] == _ballotAddr) {
                return (true, i);
            }
        }
        return (false, 0);
    }
}

