import { TokenVesting, VestingFactory } from '../../types/schema';
import {
  ERC20VestingFactory,
  VestingCreated,
} from '../../types/templates/ERC20VestingFactory/ERC20VestingFactory';
import { TokenVesting as TokenVestingContract } from '../../types/templates/TokenVesting/TokenVesting';

export function handleVestingCreated(event: VestingCreated): void {
  const tokenVestingAddress = event.params.vestingContractAddress;

  // create vestingFactory with ownerAddress + token
  const vestingFactory = new VestingFactory(event.address.toHexString());
  let vestingFactoryContract = ERC20VestingFactory.bind(event.address);

  vestingFactory.token = vestingFactoryContract.erc20Token().toHexString();
  vestingFactory.owner = vestingFactoryContract.vestingOwner().toHexString();

  let tokenVestingContract = TokenVestingContract.bind(tokenVestingAddress);

  let tokenVesting = new TokenVesting(tokenVestingAddress.toHex());

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

