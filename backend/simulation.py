"""
Bitcoin ABM v2 - Simulation Model

Block 2: Basic simulation structure with state tracking.
Block 9: Enhanced with scenario-aware dynamics.
"""

from dataclasses import dataclass, field
from typing import Dict, List, Any
import random


@dataclass
class SimulationState:
    """Current state of the simulation."""
    step: int = 0
    running: bool = False

    # Core metrics
    block_height: int = 0
    hashrate: float = 100.0  # EH/s
    difficulty: float = 1.0
    mempool_size: int = 0
    avg_fee: float = 1.0  # sats/vbyte

    # Subsystem activity counters
    blocks_mined: int = 0
    transactions_processed: int = 0
    bips_proposed: int = 0

    # Scenario tracking
    scenario_id: str = "baseline"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "step": self.step,
            "running": self.running,
            "scenario_id": self.scenario_id,
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

    Block 9: Scenario-aware dynamics with configurable parameters.
    """

    # Default parameters (baseline scenario)
    DEFAULT_PARAMS = {
        "tx_rate": 5,
        "base_hashrate": 100.0,
        "miner_count": 10,
        "block_reward": 6.25,
        "difficulty_adjustment_rate": 0.05,
        "mempool_limit": 100,
        "fee_sensitivity": 1.0,
        "hashrate_growth": 0.0,
        "bip_rate": 1,
        "consensus_threshold": 0.67,
        "dominant_miner_share": 0.0,
    }

    def __init__(self, params: Dict[str, Any] = None, scenario_id: str = "baseline"):
        self.params = {**self.DEFAULT_PARAMS, **(params or {})}
        self.scenario_id = scenario_id
        self.state = SimulationState(scenario_id=scenario_id)
        self.history: List[Dict[str, Any]] = []
        self._apply_initial_params()

    def _apply_initial_params(self):
        """Apply initial parameters to state."""
        self.state.hashrate = self.params.get("base_hashrate", 100.0)
        self.state.scenario_id = self.scenario_id

    def reset(self, params: Dict[str, Any] = None, scenario_id: str = None) -> Dict[str, Any]:
        """Reset simulation to initial state with optional new parameters."""
        if scenario_id:
            self.scenario_id = scenario_id
        if params:
            self.params = {**self.DEFAULT_PARAMS, **params}

        self.state = SimulationState(scenario_id=self.scenario_id)
        self.history = []
        self._apply_initial_params()

        return self.state.to_dict()

    def step(self) -> Dict[str, Any]:
        """
        Advance simulation by one step.

        Dynamics are driven by scenario parameters.
        """
        self.state.step += 1
        p = self.params  # Shorthand

        # === Transaction Arrival ===
        # Poisson-distributed based on tx_rate
        new_txs = int(random.expovariate(1.0 / max(1, p["tx_rate"])))
        self.state.mempool_size += new_txs
        self.state.transactions_processed += new_txs

        # === Block Mining ===
        # Probability based on hashrate vs difficulty
        block_prob = 0.1 * (self.state.hashrate / max(1, self.state.difficulty * 100))
        block_prob = min(0.3, max(0.02, block_prob))  # Clamp between 2% and 30%

        if random.random() < block_prob:
            self.state.block_height += 1
            self.state.blocks_mined += 1

            # Clear mempool based on block capacity
            block_capacity = random.randint(1500, 2500)
            cleared = min(self.state.mempool_size, block_capacity)
            self.state.mempool_size = max(0, self.state.mempool_size - cleared)

        # === Mempool Pressure (scenario-aware) ===
        if self.state.mempool_size > p["mempool_limit"] * 50:
            # Congestion: drop some transactions
            dropped = int(self.state.mempool_size * 0.05)
            self.state.mempool_size -= dropped

        # === Hashrate Dynamics ===
        # Base drift plus scenario-specific growth
        drift = random.uniform(-0.01, 0.02)
        growth = p.get("hashrate_growth", 0.0)

        # Halving effect: miners may leave if reward drops
        if p["block_reward"] < 6.0:
            # Reduced reward = some miners exit
            drift -= 0.01

        # Dominant miner effect (51% attack scenario)
        if p.get("dominant_miner_share", 0) > 0.4:
            # Centralization discourages small miners
            drift -= 0.005

        self.state.hashrate *= (1 + drift + growth)
        self.state.hashrate = max(30, min(500, self.state.hashrate))

        # === Fee Market ===
        fee_sensitivity = p.get("fee_sensitivity", 1.0)
        mempool_pressure = self.state.mempool_size / max(1, p["mempool_limit"] * 20)

        if mempool_pressure > 2.0:
            self.state.avg_fee *= (1 + 0.1 * fee_sensitivity)
        elif mempool_pressure > 1.0:
            self.state.avg_fee *= (1 + 0.03 * fee_sensitivity)
        elif mempool_pressure < 0.5:
            self.state.avg_fee *= 0.97

        self.state.avg_fee = max(1.0, min(500.0, self.state.avg_fee))

        # === Difficulty Adjustment ===
        # Every 20 blocks (simplified from 2016)
        if self.state.block_height > 0 and self.state.block_height % 20 == 0:
            adjustment_rate = p.get("difficulty_adjustment_rate", 0.05)
            target_hashrate = 100.0
            ratio = self.state.hashrate / target_hashrate
            self.state.difficulty *= (1 + (ratio - 1) * adjustment_rate)
            self.state.difficulty = max(0.5, min(10.0, self.state.difficulty))

        # === BIP Proposals (Governance) ===
        bip_rate = p.get("bip_rate", 1)
        if random.random() < 0.01 * bip_rate:
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
