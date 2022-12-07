import { Deployed } from '../../types/Create2Deployer/Create2Deployer';
import { deployedHashedBytecodes } from './bytecodes';
import {
  BaseERC20Guild as BaseERC20GuildTemplate,
  SnapshotRepERC20Guild as SnapshotRepERC20GuildTemplate,
  SnapshotERC20Guild as SnapshotERC20GuildTemplate,
} from '../../types/templates';
import { BaseERC20Guild } from '../../types/templates/BaseERC20Guild/BaseERC20Guild';
import { ERC20 } from '../../types/GuildRegistry/ERC20';
import { Guild, Token } from '../../types/schema';

function getImplementationType(hash): string | null {
  for (let i = 0; i < deployedHashedBytecodes.length; i++) {
    if (deployedHashedBytecodes[i].bytecode_hash === hash)
      return deployedHashedBytecodes[i].type;
  }
  return null;
}

function getImplementationInterface(type) {
  switch (type) {
    case 'SnapshotRepERC20Guild':
      return SnapshotRepERC20GuildTemplate;
    case 'SnapshotERC20Guild':
      return SnapshotERC20GuildTemplate;
    case 'ERC20Guild':
    case 'DXDGuild':
      return BaseERC20GuildTemplate;
    default:
      return null;
  }
}

// Handler to initialize guilds once they are deployed.
export function handleDeployedEvent(event: Deployed): void {
  const contractAddress = event.params.addr;
  const type = getImplementationType(event.params.hashedBytecode);

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
    guild.type = type;

    guild.save();

    const template = getImplementationInterface(type);
    if (!template) return;
    template.create(guildAddress);
  }
}
// Questions:
// - What is the diff templates y datasources?
// - Why do we need to do BaseERC20GuildTemplate.create(address) if we already did Guild.load()?
// - Do we need to create a new folder with empty files just to use interface/template from the abi. Why is that?

