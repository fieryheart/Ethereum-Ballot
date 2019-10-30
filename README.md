# 基于以太坊的投票系统

## 技术栈
### 后端&数据库
Truffle v5.0.42 (core: 5.0.42)  
Solidity v0.5.8 (solc-js)  
Node v10.16.0  
Web3.js v1.2.1

### 前端
webpack 4.28.1
jquery 3.4.1
bootstrap 4.3.1

## 启动开发者模式
- 终端进入项目，输入truffle console,启动开发者模式。当然也可以使用自己搭建的私有链，但需要设置truffle-config.js的相关信息

## 前端
- 终端进入app文件夹，使用npm run dev开启服务，在浏览器中输入localhost:8080展示页面

## 测试
- 终端进入项目,输入truffle console，进入控制台，然后输入test，进行智能合约的测试，其中test文件夹中是测试的相关代码