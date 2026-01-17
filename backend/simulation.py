"""
Bitcoin ABM v2 - Simulation Model

Block 2: Basic simulation structure with state tracking.
Block 3 will integrate BERT loader and full Mesa model.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any
import random


@dataclass
class SimulationState:
    """Current state of the simulation."""
    step: int = 0
    running: bool = False

    # Core metrics (will be computed by Mesa model in Block 3)
    block_height: int = 0
    hashrate: float = 100.0  # EH/s
    difficulty: float = 1.0
    mempool_size: int = 0
    avg_fee: float = 1.0  # sats/vbyte

    # Subsystem activity counters
    blocks_mined: int = 0
    transactions_processed: int = 0
    bips_proposed: int = 0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step": self.step,
            "running": self.running,
            "metrics": {
                "block_height": self.block_height,
                "hashrate": self.hashrate,
                "difficulty": self.difficulty,
                "mempool_size": self.mempool_size,
                "avg_fee": self.avg_fee,
            },
            "activity": {
                "blocks_mined": self.blocks_mined,
                "transactions_processed": self.transactions_processed,
                "bips_proposed": self.bips_proposed,
            }
        }


class BitcoinSimulation:
    """
    Bitcoin network simulation.

    Block 2: Stub implementation with random walks.
    Block 3: Full Mesa model with BERT-loaded subsystems.
    """

    def __init__(self, params: Dict[str, Any] = None):
        self.params = params or {}
        self.state = SimulationState()
        self.history: List[Dict[str, Any]] = []

        # Apply initial params
        if "hashrate" in self.params:
            self.state.hashrate = self.params["hashrate"]
        if "mempool_size" in self.params:
            self.state.mempool_size = self.params["mempool_size"]

    def reset(self, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Reset simulation to initial state."""
        self.params = params or self.params
        self.state = SimulationState()
        self.history = []

        if "hashrate" in self.params:
            self.state.hashrate = self.params["hashrate"]
        if "mempool_size" in self.params:
            self.state.mempool_size = self.params["mempool_size"]

        return self.state.to_dict()

    def step(self) -> Dict[str, Any]:
        """
        Advance simulation by one step.

        Block 2: Simple random walk placeholder.
        Block 3: Real Mesa model step with Poisson blocks, difficulty adjustment.
        """
        self.state.step += 1

        # Simulate transaction arrival (Poisson-ish)
        new_txs = random.randint(0, 10)
        self.state.mempool_size += new_txs
        self.state.transactions_processed += new_txs

        # Simulate block mining (roughly 1 block per 10 steps on average)
        if random.random() < 0.1:
            self.state.block_height += 1
            self.state.blocks_mined += 1
            # Clear some mempool
            cleared = min(self.state.mempool_size, random.randint(1000, 3000))
            self.state.mempool_size = max(0, self.state.mempool_size - cleared)

        # Hashrate drift
        self.state.hashrate *= (1 + random.uniform(-0.02, 0.03))
        self.state.hashrate = max(50, min(500, self.state.hashrate))

        # Fee market response to mempool
        if self.state.mempool_size > 5000:
            self.state.avg_fee *= 1.1
        elif self.state.mempool_size < 1000:
            self.state.avg_fee *= 0.95
        self.state.avg_fee = max(1.0, min(500.0, self.state.avg_fee))

        # Difficulty adjustment every 2016 blocks (simplified)
        if self.state.block_height > 0 and self.state.block_height % 20 == 0:
            # Adjust based on hashrate
            self.state.difficulty *= (self.state.hashrate / 100.0) ** 0.1

        # Occasional BIP proposal
        if random.random() < 0.01:
            self.state.bips_proposed += 1

        # Record history
        self.history.append(self.state.to_dict())

        return self.state.to_dict()

    def get_state(self) -> Dict[str, Any]:
        """Return current simulation state."""
        return self.state.to_dict()

    def get_history(self, last_n: int = None) -> List[Dict[str, Any]]:
        """Return simulation history."""
        if last_n:
            return self.history[-last_n:]
        return self.history
