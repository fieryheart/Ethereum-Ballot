const BallotCollection = artifacts.require("BallotCollection");

contract("BallotCollection", accounts => {

    let ballotCollection;
    const _password = "123456";

    // 测试创建投票集合
    it("should create a new BallotCollection", async () => {
        ballotCollection = await BallotCollection.deployed();
        const owner = await ballotCollection.getOwner.call();
        assert.equal(
            owner,
            accounts[0],
            `${owner} is not the owner`
        )
    })

    // 测试创建新用户
    it("should create a new user", async () => {
        const result = await ballotCollection.newUser(accounts[1], _password);
        await ballotCollection.newUser(accounts[2], _password);
        // console.log(result);
        // assert.equal(
        //     result[0],
        //     true,
        //     `New user is not created`
        // );
    })

    // 测试用户登录
    it("should login in", async () => {
        const result = await ballotCollection.toLogin.call(accounts[1], _password, {from: accounts[1]});
        console.log(result);
    })

    // 测试创建新投票
    const _topic = "班长选举";
    const _proposal_name = ["zhangsan", "lisi", "wangwu"].map((val) => web3.utils.asciiToHex(val))
    it("should create a new ballot", async () => {
        const result = await ballotCollection.newBallot(_topic, _proposal_name, {from: accounts[1]});
        console.log(result.logs[0].args);
    });

    // 测试获取投票所有地址
    let allBallotsAddress;
    it("should get all address of ballots", async () => {
        const result = await ballotCollection.getAllBallotsAddress.call({from: accounts[1]});
        console.log(result);
        allBallotsAddress = result[1];
    })

    // 测试获取投票信息
    it("should get the information of the ballot", async () => {
        const result = await ballotCollection.getBallotInfo.call(allBallotsAddress[0], {from: accounts[1]});
        console.log(result);
    })

    // 测试获取投票数据
    it("should get the data of the proposals", async () => {
        const result = await ballotCollection.getBallotVote.call(allBallotsAddress[0], {from: accounts[1]});
        console.log(result);
    })

    // 测试显示投票状态
    it("should get the status of the ballot", async () => {
        const result = await ballotCollection.getBallotStatus.call(allBallotsAddress[0], {from: accounts[1]});
        console.log(result);
    })

    // 测试获取赢家
    it("shoukd get the winners of the ballot", async () => {
        const result = await ballotCollection.getBallotWinner.call(allBallotsAddress[0], {from: accounts[1]});
        console.log(result);
    })


    // 测试设置主题
    it("should set the topic of the ballot", async () => {
        const new_topic = "班干部选举";
        const result = await ballotCollection.setBallotTopic(allBallotsAddress[0], new_topic, {from: accounts[1]});
        console.log(result.logs[0].args);
    })


    // 增加投票项    
    it("should add the proposal of the ballot", async () => {
        const result = await ballotCollection.addBallotProposal(allBallotsAddress[0], "maliu", {from: accounts[1]});
        console.log(result.logs[0].args);
    })

    // 删除投票项
    it("should delete the proposal of the ballot", async () => {
        const result = await ballotCollection.deleteBallotProposal(allBallotsAddress[0], "maliu", {from: accounts[1]});
        console.log(result.logs[0].args);
    })

    // 设置状态
    it("should set the status of the ballot", async () => {
        const result = await ballotCollection.setBallotStatus(allBallotsAddress[0], true, {from: accounts[1]});
        console.log(result.logs[0].args);
    })

    // 投票
    it("should vote the proposal", async () => {
        await ballotCollection.setBallotStatus(allBallotsAddress[0], false, {from: accounts[1]});
        const result_1 = await ballotCollection.votingBallot(allBallotsAddress[0], "zhangsan", {from: accounts[1]});
        console.log(result_1.logs[0].args);
        const result_2 = await ballotCollection.votingBallot(allBallotsAddress[0], "zhangsan", {from: accounts[1]});
        console.log(result_2.logs[0].args);
    })
});