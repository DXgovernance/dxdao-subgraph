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

// Event get the deploy event. We get from params the address and salt but we don't get the actual bytecode deployed. Find a way to retreive that.
export function handleDeployedEvent(event: Deployed): void {
  const contractAddress = event.params.addr;
  const type = getImplementationType(event.params.hashedBytecode);

  if (!type) {
    // TODO: do something here?
    // esto no es una guild o no machea con ningún bytecode
  } else {
    // Esto es una guild
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
    // It could already exist as well if it was removed from the registry in the past,
    // so load it instead if it does
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

// - cuál es la diff entre templates y datasources?
// - Por qué necesito hacer un BaseERC20GuildTemplate.create(address) si ya tenemos Guild.load() y demás?
// - Por qué no me aparecen las interfaces(templates) si no agrego una carpeta en mappings con el nombre y los 3 archivos vacíos?

