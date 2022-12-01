import {
  Deployed,
  DeployCall,
} from '../../types/Create2Deployer/Create2Deployer';
import { DeployedHashedBytecodes } from './bytecodes';
import { log } from '@graphprotocol/graph-ts';

// Event get the deploy event. We get from params the address and salt but we don't get the actual bytecode deployed. Find a way to retreive that.
export function handleDeployedEvent(event: Deployed): void {
  const contractAddress = event.params.addr.toString();
  const contractSalt = event.params.salt;

  // TODO:
  // 1. Get bytecode. (where?)
  // const bytecode = event.receipt?.logs[0].??????
  // 2. hash bytecode to compare
  // 3. Match hashed bytecode with deployedBytecodes and return/save guild type
}

// If event is not enought we can use function trigger to get bytecode from args but we don't get the actual address, so is kind of the same thing.
// Maybe finding the address is easy. If not remove this handler.
export function handleDeployFunction(call: DeployCall): void {
  const bytecode = call.inputs.code;
  const salt = call.inputs.salt;

  // const address = call.???
}

