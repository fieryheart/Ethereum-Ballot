const ConvertLib = artifacts.require("ConvertLib");
const Ballot = artifacts.require("Ballot");
const BallotCollection = artifacts.require("BallotCollection");

module.exports = function(deployer) {
  deployer.deploy(ConvertLib);
  deployer.link(ConvertLib, [Ballot, BallotCollection]);
  deployer.deploy(BallotCollection);
};
