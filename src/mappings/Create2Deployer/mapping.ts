import { Deployed } from '../../types/Create2Deployer/Create2Deployer';
import { ethereum, Bytes, json, DataSourceTemplate} from '@graphprotocol/graph-ts';

import {
  BaseERC20Guild as BaseERC20GuildTemplate,
  SnapshotRepERC20Guild as SnapshotRepERC20GuildTemplate,
  SnapshotERC20Guild as SnapshotERC20GuildTemplate,
} from '../../types/templates';
import { BaseERC20Guild } from '../../types/templates/BaseERC20Guild/BaseERC20Guild';
import { ERC20 } from '../../types/GuildRegistry/ERC20';
import { Guild, Token } from '../../types/schema';

const deployedHashedBytecodesJSON = '[{"type":"ERC20Guild","bytecode_hash":"0xa6a7463a986b6043eec40fa1589592ed2357027522e816e4a2742a7de9c916e4","features":[]},{"type":"SnapshotRepERC20Guild","bytecode_hash":"0x5220f03f768c7f09437ccf760eb5307dc60f60e18c9c9ff9599a9ab3ad71d2a0","features":["REP","SNAPSHOT"]},{"type":"SnapshotERC20Guild","bytecode_hash":"0xfc721cf4ee3e10d6df0dc8659bc71c86ec7b2116001838e1d9bc30ccfbe8cfac","features":["SNAPSHOT"]},{"type":"DXDGuild","bytecode_hash":"0xd5902fb6fc81853ceacf1bbca411b1c78a4809ae854a858f34197b056c438ca2","features":[]}]'
const parsedJson = json.fromString(deployedHashedBytecodesJSON);
const deployedHashedBytecodes = parsedJson.toArray();

function getImplementationType(hash: string): string | null {
  for (let i = 0; i < deployedHashedBytecodes.length; i++) {
    const parsedObject = deployedHashedBytecodes[i].toObject()
    const jsonHash = parsedObject.get("bytecode_hash");
    if (!jsonHash) continue;
    if (!!parsedObject && jsonHash.toString() === hash){
      const type = parsedObject.get("type");
      if (!! type) return type.toString();
      return null
    }
  }
  return null;
}

// Handler to initialize guilds once they are deployed.
export function handleDeployedEvent(event: Deployed): void {
  const contractAddress = event.params.addr;
  const type = getImplementationType(event.params.hashedBytecode.toString());

  if (!!type) {
    // If no type found, contract deployed was not a guil and will not be trated here.
    const guildAddress = contractAddress;

    let contract = BaseERC20Guild.bind(guildAddress);

    // Get token config
    let tokenAddress = contract.getToken();
    let tokenContract = ERC20.bind(tokenAddress);
    let token = Token.load(tokenAddress.toHexString());
    if (!token) {
      token = new Token(tokenAddress.toHexString());
    }
    token.name = tokenContract.name();
    token.type = 'ERC20';
    token.symbol = tokenContract.symbol();
    token.decimals = tokenContract.decimals();
    token.save();

    // Create Guild instance.
    let guild = Guild.load(guildAddress.toHexString());
    if (guild == null) {
      guild = new Guild(guildAddress.toHex());
    }

    // Save Guild config
    guild.name = contract.getName();
    guild.permissionRegistry = contract.getPermissionRegistry().toHexString();
    guild.proposalTime = contract.getProposalTime();
    guild.lockTime = contract.getLockTime();
    guild.timeForExecution = contract.getTimeForExecution();
    guild.votingPowerForProposalCreation =
      contract.getVotingPowerForProposalCreation();
    guild.votingPowerForProposalExecution =
      contract.getVotingPowerForProposalExecution();
    guild.voteGas = contract.getVoteGas();
    guild.maxGasPrice = contract.getMaxGasPrice();
    guild.maxActiveProposals = contract.getMaxActiveProposals();
    guild.minimumMembersForProposalCreation =
      contract.getMinimumMembersForProposalCreation();
    guild.minimumTokensLockedForProposalCreation =
      contract.getMinimumTokensLockedForProposalCreation();
    guild.token = token.id;
    guild.isActive = false;
    guild.proposals = [];
    guild.members = [];

    if (!!type){
      guild.type = type;
    }

    guild.save();

    if (!!type){
      if (type === 'SnapshotRepERC20Guild') {
        SnapshotRepERC20GuildTemplate.create(guildAddress);
      } else if (type === 'SnapshotERC20Guild'){
        SnapshotERC20GuildTemplate.create(guildAddress);
      } else if (type === 'ERC20Guild' || type === 'DXDGuild'){
        BaseERC20GuildTemplate.create(guildAddress);
      } 
    }

  }
}
// Questions:
// - What is the diff templates y datasources?
// - Why do we need to do BaseERC20GuildTemplate.create(address) if we already did Guild.load()?
// - Do we need to create a new folder with empty files just to use interface/template from the abi. Why is that?

