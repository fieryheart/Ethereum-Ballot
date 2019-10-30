pragma solidity >=0.4.16 <0.7.0;

import "./ConvertLib.sol";

contract Ballot{

    uint ID;
    bytes32 topic;
    address belong; // 投票拥有者地址
    bool closed; // 是否关闭
    bytes32[] proposal_name; // 选项名
    uint[] proposal_vote_count; // 选项投票数
    bytes32[] winners; // 获胜者
    bytes32[] temp_proposal_name; // 临时投票选项
    uint[] temp_proposal_vote_count; // 临时选项名


    mapping(address => bool) isVoting; // 该地址是否已经投票

    modifier onlyBelong() {
        if(msg.sender == belong) _;
    }

    constructor(uint _id, string memory _topic, bytes32[] memory _proposal_name) public {
        belong = msg.sender;
        closed = true;
        proposal_name = _proposal_name;
        topic = ConvertLib.stringToBytes32(_topic);
        ID = _id;
        for(uint i = 0; i < _proposal_name.length; i++) {
            proposal_vote_count.push(0);
        }
    }

    // 获取ID
    function getID() public view returns (uint) {
        return ID;
    }

    // 获取标题
    function getTopic() public view returns (bytes32) {
        return topic;
    }

    // 获取拥有者
    function getBelong() public view returns (address) {
        return belong;
    }

    // 获取投票是否关闭
    function getClosed() public view returns (bool) {
        return closed;
    }

    function getInfo() public view returns (uint, bytes32, address, bytes32[] memory) {
        return (ID, topic, belong, proposal_name);
    }

    // 获取投票情况
    function getVote() public view returns (bytes32[] memory, uint[] memory) {
        return (proposal_name, proposal_vote_count);
    }

    event Print(address, address);
    // 设置拥有者
    function setBelong(address _belong) public {
        belong = _belong;
    }

    // 设置标题
    function setTopic(bytes32 _topic) public {
        topic = _topic;
    }

    // 增加投票选项
    function addProposal(bytes32 _name) public {
        if(!isProposalAlreadyExist(_name)) {
            proposal_name.push(_name);
            proposal_vote_count.push(0);
        }
    }

    // 删除投票选项
    function deleteProposal(bytes32 _name) public {
        if(isProposalAlreadyExist(_name)) {
            delete temp_proposal_name;
            delete temp_proposal_vote_count;
            for(uint i = 0; i < proposal_name.length; i++) {
                if(proposal_name[i] != _name) {
                    temp_proposal_name.push(proposal_name[i]);
                    temp_proposal_vote_count.push(proposal_vote_count[i]);
                }
            }
            delete proposal_name;
            delete proposal_vote_count;
            proposal_name = temp_proposal_name;
            proposal_vote_count = temp_proposal_vote_count;
        }
    }

    event SendMessage(string);
    // 投票
    function voting(address _addr, bytes32 _name) public returns (bool, string memory) {
        if(closed) return (false, "投票暂未开放");
        if(isVoting[_addr]) return (false, "该用户已经投票");
        if(isProposalAlreadyExist(_name)) {
            for(uint i = 0; i < proposal_name.length; i++) {
                if(proposal_name[i] == _name) {
                    proposal_vote_count[i] = proposal_vote_count[i]+1;
                    isVoting[_addr] = true;
                    return (true, "投票成功");
                }
            }
        } else {
            return (false, "不存在该投票项");
        }
    }

    // 投票项是否存在
    function isProposalAlreadyExist(bytes32 name) internal view returns (bool) {
        for(uint i = 0; i < proposal_name.length; i++) {
            if(proposal_name[i] == name) {
                return true;
            }
        }
        return false;
    }

    // 关闭票选
    function closing(address _addr) public {
        require(_addr == belong, "本用户没有该投票权限");
        closed = true;
    }

    // 开放票选
    function opening(address _addr) public {
        require(_addr == belong, "本用户没有该投票权限");
        closed = false;
    }

    // 获奖
    function getWinner() public returns (bytes32[] memory names) {
        uint maxn = 0;
        delete winners;
        for(uint i = 0;i < proposal_name.length; i++) {
            if(proposal_vote_count[i] > maxn) {
                maxn = proposal_vote_count[i];
                delete winners;
                winners.push(proposal_name[i]);
            } else if(proposal_vote_count[i] == maxn) {
                winners.push(proposal_name[i]);
            }
        }
        names = winners;
    }
}