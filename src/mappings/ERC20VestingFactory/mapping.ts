import {
  ERC20VestingFactory,
  VestingCreated,
} from '../../../../../../dxdao-subgraph/src/types/templates/ERC20VestingFactory/ERC20VestingFactory';
import { TokenVesting as TokenVestingContract } from '../../../../../../dxdao-subgraph/src/types/templates/TokenVesting/TokenVesting';
import { TokenVesting, VestingFactory } from '../../../../../../dxdao-subgraph/src/types/schema';

export function handleVestingCreated(event: VestingCreated): void {
  const tokenVestingAddress = event.params.vestingContractAddress;

  // create vestingFactory with ownerAddress + token
  const vestingFactory = new VestingFactory(event.address.toHexString());
  let vestingFactoryContract = ERC20VestingFactory.bind(event.address);

  vestingFactory.token = vestingFactoryContract.erc20Token().toHexString();
  vestingFactory.owner = vestingFactoryContract.vestingOwner().toHexString();

  let tokenVestingContract = TokenVestingContract.bind(tokenVestingAddress);

  // what should be the PK here?
  let tokenVesting = new TokenVesting(tokenVestingAddress.toHex());

  // should get the erc20Token and vestingOwner from the vestingFactory
  // IERC20 public erc20Token;
  // address public vestingOwner;

  tokenVesting.beneficiary = tokenVestingContract.beneficiary().toString();
  tokenVesting.cliff = tokenVestingContract.cliff();
  tokenVesting.start = tokenVestingContract.start();
  tokenVesting.duration = tokenVestingContract.duration();
  tokenVesting.revocable = tokenVestingContract.revocable();
  tokenVesting.released = tokenVestingContract.released(
    vestingFactoryContract.erc20Token()
  );
  tokenVesting.revoked = tokenVestingContract.revoked(
    vestingFactoryContract.erc20Token()
  );
  tokenVesting.owner = vestingFactory.owner;
  tokenVesting.token = vestingFactory.token;

  vestingFactory.save();

  tokenVesting.save();
}

