import Web3 from "web3";
import ballotCollectionArtifact from "../../../build/contracts/BallotCollection.json";

const App = {
    web3: null,
    account: null,
    meta: null,
  
    start: async function() {
      const { web3 } = this;
  
      try {
        // 获取合约实例
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ballotCollectionArtifact.networks[networkId];
        this.meta = new web3.eth.Contract(
          ballotCollectionArtifact.abi,
          deployedNetwork.address,
        );
  
        // 获取账户
        const accounts = await web3.eth.getAccounts();
        this.account = accounts[0];
        console.log("accounts: ", accounts);
  
      } catch (error) {
        console.error("Could not connect to contract or chain.");
      }
    },
  
    // 注册
    signUp: async function() {
      const address = "0x7852c9D2DeA82B942cEfD0837B6754B96E0E482C";
      const password = "123456";
      const repeatPasswword = "123456";
      // console.log(this.meta);
      const {newUser} = this.meta.methods;
      const {newUserReturnMessage} = this.meta.events;
      newUserReturnMessage((err, result) => {
        console.log("err:", err);
        console.log("returnValues:", result.returnValues);



      });
      const trasactionValue = await newUser(address, password).send({ from: address , gas: 3000000});
    },

    // 登陆
    signIn: async function() {
        const address = "0x7852c9D2DeA82B942cEfD0837B6754B96E0E482C";
        const password = "123456";
        const { toLogin } = this.meta.methods;
        const result = await toLogin(address, password).call({from: address});
        console.log(result);
        // 缓存改地址

        
    },

};

window.addEventListener("load", function() {
    if (window.ethereum) {
      // use MetaMask's provider
      App.web3 = new Web3(window.ethereum);
      window.ethereum.enable(); // get permission to access accounts
    } else {
      const network = `ws://127.0.0.1:9545`;
      console.warn(
        `No web3 detected. Falling back to ${network}. You should remove this fallback when you deploy live`,
      );
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      App.web3 = new Web3(
        // new Web3.providers.HttpProvider(network),
        new Web3.providers.WebsocketProvider(network)
      );
    }
  
    App.start();
  });
  

export default App;