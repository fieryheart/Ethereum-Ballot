import Web3 from "web3";
import DonateArtifact from "../../build/contracts/Vote.json";
import { runInThisContext } from "vm";
function getCaption(obj){

    var index=obj.lastIndexOf("\=");
    obj=obj.substring(index+1,obj.length);
//  console.log(obj);
    return obj;
}
function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
	var str;
	
    str=getCaption(url);
       return str;
    }


function hexCharCodeToStr(hexCharCodeStr) {
	var trimedStr = hexCharCodeStr.trim();
	var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;

	var len = rawStr.length;
	if (len % 2 !== 0) {
		alert("Illegal Format ASCII Code!");
		return "";
	}

	var curCharCode;
	var resultStr = [];
	for (var i = 0; i < len; i = i + 2) {
		curCharCode = parseInt(rawStr.substr(i, 2), 16); // ASCII Code Value
		resultStr.push(String.fromCharCode(curCharCode));
	}

	return resultStr.join("");
}

function strToHexCharCode(str) {
	if (str === "") return "";

	var hexCharCode = [];
	hexCharCode.push("0x");
	for (var i = 0; i < str.length; i++) {
		hexCharCode.push((str.charCodeAt(i)).toString(16));
	}

	return hexCharCode.join("");
}

const App = {
	web3: null,
	contracts:{},
	account: '0x0',
	meta:null,
	proof:null,

	 start: async function() {
    const { web3 } = this;

    try {
      // 获取合约实例
      const networkId = await web3.eth.net.getId();

      const deployedNetwork = DonateArtifact.networks[networkId];

      this.meta = new web3.eth.Contract(
        DonateArtifact.abi,
        deployedNetwork.address,
	  );
	 
      try{
        const accounts = await web3.eth.getAccounts();
        if(accounts.length == 0) {
          alert("以太坊账户为空");
          return;
        }
        console.log("accounts", accounts);
        this.account = accounts[0];
       
      } catch(err) {
        console.error("获取以太坊账户失败");
      }
      
      
    } catch (error) {
      console.error("不能连接到合约或区块");
    }
  },
	
 

	login: async function() {
		var $address = $("#address").val();
		var $pwd = $("#pwd").val();
		var $identity = $("input[name='identity']:checked").val();
		console.log("登录信息已经获取,address:"+$address+"pwd:"+$pwd+"identity:"+$identity);
		this.account=$address;
	
		if ($identity=="Voter") {
			//this.meta.methodeployed().then(function(instance){
			//	return instance.getDonatorPassword($address, {from: account});
			//}).
				this.meta.methods.getVoterPassword($address).call().then(function(result) {
				console.log("用户输入密码:"+$pwd);
				console.log("实际密码应为:"+hexCharCodeToStr(result[1]));
				if (result[0]) {
					//查询密码成功
					if ($pwd.localeCompare(hexCharCodeToStr(result[1])) === 0){
						console.log("投票观众登录成功~");
						location.href = "voter.html?account=" + $address;
					} else {
						console.log("投票观众密码错误，登录失败~");
						alert("投票观众密码错误，登录失败~");
					}
				} 
				else {
					//查询密码失败
					console.log("该投票观众用户不存在，请确定账号后再登录~");
					alert("该投票观众用户不存在，请确定账号后再登录~");
				}
			});
		} 
		else if ($identity=="Company") {
			//this.meta.deployed().then(function(instance){
			//	return instance.getOrganizationPassword($address, {from: account});
			//}).
				this.meta.methods.getCompanyPassword($address).call().then(function(result) {
				console.log($pwd);
				console.log(hexCharCodeToStr(result[1]));
				if (result[0]) {
					//查询密码成功
					if ($pwd.localeCompare(hexCharCodeToStr(result[1] ))=== 0){
						console.log("企划社登录成功~");
						location.href = "company.html?account=" + $address;
					} else {
						console.log("企划社密码错误，登录失败~");
						alert("企划社错误，登录失败");
					}
				} else {
					//查询密码失败
					console.log("该企划社用户不存在，请确定账号后再登录~");
					alert("该企划社用户不存在，请确定账号后再登录~");
				}
			});
		}

	},
	register: function() {
		var $address = $("#address").val();
		var $username=$("#username").val();
		var $pwd = $("#pwd").val();
		var $identity = $("input[name='identity']:checked").val();
		console.log("注册信息已经获取,address:"+$address+"  username:"+$username+"  pwd:"+$pwd+"  identity:"+$identity);
		if ($identity=="Voter") {
			//this.meta.deployed().then(function(instance){
				//instance.NewDonator({},{fromBlock:0,toBlock:'latest'}).watch(function(err, event){
				//	console.log(event.args.message);
				//	alert(event.args.message);
			//	});
			//	return instance.newDonator($address,$username,$pwd,{from:account});
			//});
			
			this.meta.methods.newVoter($address,$username,$pwd).send({ from: this.account, gas: 1000000});
			alert("注册成功！请去登录界面登录");
		} 
		else if ($identity=="Company") {

			//this.meta.deployed().then(function(instance){
			//	instance.NewOrganization({},{fromBlock:0,toBlock:'latest'}).watch(function(err, event){
			//		console.log(event.args.message);
			//		alert(event.args.message);
			//	});
			//	return instance.newOrganization($address,$username,$pwd,{from:account});
			//});
			this.meta.methods.newCompany($address,$username,$pwd).send({ from: this.account, gas: 1000000});
			alert("注册成功！请去登录界面登录");

		}
	},

	renderAllSingers:async function(){
		
		var $loader=$("#loader");
		var $content=$("#content");
		
		$loader.hide();
		$content.show();
		//加载选手的资料
		
		var metaa=this.meta;
		console.log(metaa);
		metaa.methods.getSingersNum().call().then(function(singerCount){
			var $singers=$("#singers");
			$singers.empty();
			var j=1;
			
		
			
			for(var i=0;i<singerCount;i++){
				metaa.methods.getSinger(i).call().then(function(pid){
					//alert(pid+"hello");
					metaa.methods.singer(pid).call().then(function(Singer){
						
						metaa.methods.company(Singer[3]).call().then(function(Company){
							console.log(Company[1]);
							var singerId=hexCharCodeToStr(Singer[0]);
							//选手姓名
							var singerName=Singer[1];
							var singerDescription=Singer[2];
							var singerBelong=Company[1];
							var score=Singer[4];
							var raisedVotes=Singer[5];
							var Template = "<tr><th>"+j+"</th><td>"+singerId+"</td><td>"+singerName+"</td><td>"+singerDescription+"</td><td>"+singerBelong+"</td><td>"+score+"</td><td>"+raisedVotes+"</td></tr>";
		          			$singers.append(Template);
		          			j++;
						});
					});

				});
			}
			$loader.hide();
      		$content.show();

		});
	},

	renderPublishSingers:async function(){
		var renderInstance;
		var $publishRecordlists=$("#publishRecordlists");
		var account=GetRequest();
		var $loader=$("#loader");
		
		
		$loader.hide();
	
		var metaa=this.meta;
		metaa.methods.company(account).call().then(function(Company){
			console.log("当前账号发布歌手信息数量为:"+Company[3]);
			//return renderInstance.getProjectsNum();
			metaa.methods.getSingersNum().call().then(function(singerCount){
			var k=1;
			for(var i=0;i<singerCount;i++){
				metaa.methods.getSinger(i).call().then(function(pid){
					metaa.methods.singer(pid).call().then(function(Singer){

						if(Singer[3]==account){
							var singerId=hexCharCodeToStr(Singer[0]);
							//选手姓名
							var singerName=Singer[1];

							//选手信息
							var singerDescription=Singer[2];
							//选手海选综合评分
							var score=Singer[4];
							//选手已获票数
							var raisedVotes=Singer[5];

							var plate="<tr><th>"+k+"</th><td>"+singerId+"</td><td>"+singerName+"</td><td>"+singerDescription+"</td><td>"+score+"</td><td>"+raisedVotes+"</td></tr>";;
							$publishRecordlists.append(plate);
							k++;
						}

					});
				});
			}
		});})
	},

	renderRecords:function(){
		var recordInstance;
		var $voteRecordlists=$("#voteRecordlists");
		var $loader=$("#loader");
		
		
		$loader.hide();
		var metaa=this.meta;
		var myaccount=GetRequest();
			
		metaa.methods.voter(myaccount).call().then(function(Voter){
			console.log("一共投票"+Voter[3]+"次，一共投票"+Voter[4]+"票数");
			
			
			//return recordInstance.getRecordsNum();
			metaa.methods.getRecordsNum().call().then(function(recordCount){
			
			var k=1;
			
			for(var i=0;i<recordCount;i++){
				metaa.methods.record(i).call().then(function(Record){
					if(Record[1]==myaccount){
						metaa.methods.singer(Record[2]).call().then(function(Singer){
							var pname=Singer[1];
							var temp = "<tr><th>"+k+"</th><td>"+pname+"</td><td>"+Record[3]+"</td></tr>";
							$voteRecordlists.append(temp);
							k++;
						});
					}
				});
			}
		});
	});},

	addSinger: function() {
		
		
			var account=GetRequest();
			
			
		
		
		var id = $("#singerId").val();
		var name = $("#singerName").val();
		var description = $("#singerDescription").val();
		
		var belong=account;
	
		var score = $("#score").val();
		console.log("获取发布项目信息:"+id+name+description+belong+score);
		//App.contracts.Donate.deployed().then(function(instance){
		//	instance.AddProject({},{fromBlock:0,toBlock:'latest'}).watch(function(err, event){
		//			console.log(event.args.message);
		//			alert(event.args.message);
		//	});
		//	return instance.addProject(id,name,description,belong,expectation,{from: account});
		//});
		this.meta.methods.addSinger(id,name,description,belong,score).send({ from: this.account, gas: 1000000});
		alert("添加选手成功！您可在投票中心查看选手信息");
	},
	voteSinger: async function(){
		var account=GetRequest();
		var id = $("#singerId").val();
		var giveVotes =$("#votes").val();
	
		console.log("获取发布项目信息:"+id+giveVotes+account);
	
		//App.contracts.Donate.deployed().then(function(instance){
		//	instance.DonateProject({},{fromBlock:0,toBlock:'latest'}).watch(function(error, event) {
		//		console.log(event.args.message);
		//		alert(event.args.message);
		//	});
		//	return instance.donateProject(account, id, donatedMoney, {from: account});
		//});
		this.meta.methods.voteSinger(account, id, giveVotes).send({ from: this.account, gas: 1000000});
		
		alert("投票成功！您可在投票记录中查询投票情况");
	
	}
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:9545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      // new Web3.providers.HttpProvider("http://127.0.0.1:9545"),
      new Web3.providers.WebsocketProvider('ws://localhost:9545'),
    );
  }

  App.start();
});