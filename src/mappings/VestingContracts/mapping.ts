export function handleVestingCreated(event: VestingCreated) {
  const tokenVestingAddress = event.params.vestingContractAddress;

  // create vestingFactory with ownerAddress + token
  const vestingFactory = new VestingFactory(event.params.address)
  let vestingFactoryContract = vestingFactory.bind(event.params.address);
  vestingFactory.erc20Token = vestingFactoryContract.erc20Token;
  vestingFactory.vestingOwner = vestingFactoryContract.vestingOwner;

  const vestingContract = createTokenVesting(tokenVestingAddress);

  // not sure if it will be necessary to track the vestingFactorys or just save into the vestingContract the owner and the address

  vestingFactory.save();
  
  vestingContract.save();
}

export function handleTokensReleased(event: TokensReleased) {
  // get vestingContractAddress from event?
  // const vestingContractAddress = event.

  let tokenVesting = TokenVesting.load(vestingContractAddress);

  if (!tokenVesting) {
    tokenVesting = createTokenVesting(vestingContractAddress);
  }

  tokenVesting.value = event.params.amount;

  tokenVesting.save();
}

export function handleTokenVestingRevoked(event: TokenVestingRevoked) {
  // get contract
  // get value

  let contract = TokenVesting.bind(event.params.address);

  let tokenVesting = VestingContract.load(event.params.address)

  tokenVesting.value = contract.released(tokenVesting.token)

  tokenVesting.save();
  
}

function createTokenVesting(address: string) {
  let contract = TokenVesting.bind(address);

  let tokenVesting = new VestingContract(address.toHex());

  // should get the erc20Token and vestingOwner from the vestingFactory
  // IERC20 public erc20Token;
  // address public vestingOwner;

  tokenVesting.beneficiary = contract.beneficiary();
  tokenVesting.start = contract.start();
  tokenVesting.cliffDuration = contract.cliffDuration();
  tokenVesting.duration = contract.duration();
  tokenVesting.value = contract.value();

  return tokenVesting;
  
}

