"""
Bitcoin ABM v2 - BERT Model Loader

Block 3: Updated loader for new archetype schema.
Maps archetypes (Economy/Agent/Governance) and complexity levels to ABM behaviors.
"""

import json
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from pathlib import Path


# =============================================================================
# Archetype → Behavior Mappings
# =============================================================================

ARCHETYPE_BEHAVIORS = {
    # Economy archetype: Optimizes for profit, responds to incentives
    "Economy": {
        "decision_style": "profit_maximizing",
        "adaptation_rate": 0.8,
        "risk_tolerance": 0.6,
        "responds_to": ["fees", "rewards", "costs"],
        "color": "#f7931a",  # Bitcoin orange
    },
    # Agent archetype: Goal-directed, accumulates evidence, proposes changes
    "Agent": {
        "decision_style": "evidence_based",
        "adaptation_rate": 0.5,
        "risk_tolerance": 0.3,
        "responds_to": ["technical_signals", "community_feedback", "research"],
        "color": "#4a90d9",  # Blue
    },
    # Governance archetype: Enforces rules, votes on changes, consensus-seeking
    "Governance": {
        "decision_style": "consensus_seeking",
        "adaptation_rate": 0.2,
        "risk_tolerance": 0.1,
        "responds_to": ["consensus_rules", "votes", "activation_signals"],
        "color": "#50c878",  # Green
    },
    # No archetype: Simple, fixed rules
    None: {
        "decision_style": "rule_following",
        "adaptation_rate": 0.0,
        "risk_tolerance": 0.0,
        "responds_to": [],
        "color": "#888888",  # Gray
    },
}

COMPLEXITY_PARAMS = {
    # Simple: Fixed rules, no adaptation
    "Simple": {
        "can_adapt": False,
        "can_evolve": False,
        "learning_rate": 0.0,
    },
    # Adaptable: Can adjust behavior, no structural change
    "Adaptable": {
        "can_adapt": True,
        "can_evolve": False,
        "learning_rate": 0.1,
    },
    # Evolveable: Can change structure/strategy
    "Evolveable": {
        "can_adapt": True,
        "can_evolve": True,
        "learning_rate": 0.3,
    },
}


# =============================================================================
# Data Classes
# =============================================================================

@dataclass
class Subsystem:
    """Represents a BERT subsystem with its configuration."""
    id: str
    name: str
    description: str
    level: int
    parent_id: Optional[str]
    archetype: Optional[str]
    complexity: str  # Simple, Adaptable, Evolveable
    behavior: Dict[str, Any] = field(default_factory=dict)
    children: List['Subsystem'] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description[:200] + "..." if len(self.description) > 200 else self.description,
            "level": self.level,
            "parent_id": self.parent_id,
            "archetype": self.archetype,
            "complexity": self.complexity,
            "behavior": self.behavior,
            "children": [c.to_dict() for c in self.children],
        }


@dataclass
class Flow:
    """Represents a flow/interaction between subsystems."""
    id: str
    name: str
    source_id: str
    sink_id: str
    substance_type: str
    usability: str  # Resource, Product, Waste

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "source_id": self.source_id,
            "sink_id": self.sink_id,
            "substance_type": self.substance_type,
            "usability": self.usability,
        }


# =============================================================================
# Loader Functions
# =============================================================================

def parse_complexity(complexity_field: Dict[str, Any]) -> tuple[str, bool, bool]:
    """
    Parse BERT complexity field to determine complexity level.

    Returns:
        tuple: (complexity_name, adaptable, evolveable)
    """
    if not complexity_field:
        return ("Simple", False, False)

    # Handle nested Complex structure
    if "Complex" in complexity_field:
        inner = complexity_field["Complex"]
        adaptable = inner.get("adaptable", False)
        evolveable = inner.get("evolveable", False)

        if evolveable:
            return ("Evolveable", True, True)
        elif adaptable:
            return ("Adaptable", True, False)
        else:
            return ("Simple", False, False)

    return ("Simple", False, False)


def load_bert_model(json_path: str) -> Dict[str, Any]:
    """Load BERT JSON file."""
    path = Path(json_path)
    if not path.exists():
        raise FileNotFoundError(f"BERT model not found: {json_path}")

    with open(path, 'r') as f:
        return json.load(f)


def extract_subsystems(model: Dict[str, Any]) -> Dict[str, Subsystem]:
    """
    Extract all subsystems from BERT model.

    Returns:
        Dict mapping system ID to Subsystem object
    """
    subsystems = {}

    for system in model.get('systems', []):
        info = system.get('info', {})
        system_id = info.get('id', '')
        name = info.get('name', '')
        description = info.get('description', '')
        level = info.get('level', 0)
        parent_id = system.get('parent')

        # Parse complexity
        complexity_name, adaptable, evolveable = parse_complexity(
            system.get('complexity', {})
        )

        # Get archetype (may be None)
        archetype = system.get('archetype')

        # Build behavior config from archetype + complexity
        behavior = {
            **ARCHETYPE_BEHAVIORS.get(archetype, ARCHETYPE_BEHAVIORS[None]),
            **COMPLEXITY_PARAMS.get(complexity_name, COMPLEXITY_PARAMS["Simple"]),
        }

        subsystem = Subsystem(
            id=system_id,
            name=name,
            description=description,
            level=level,
            parent_id=parent_id,
            archetype=archetype,
            complexity=complexity_name,
            behavior=behavior,
        )
        subsystems[system_id] = subsystem

    return subsystems


def build_hierarchy(subsystems: Dict[str, Subsystem]) -> List[Subsystem]:
    """
    Build hierarchical tree from flat subsystem dict.

    Returns:
        List of top-level subsystems with children populated
    """
    # Assign children to parents
    for subsystem in subsystems.values():
        if subsystem.parent_id and subsystem.parent_id in subsystems:
            parent = subsystems[subsystem.parent_id]
            parent.children.append(subsystem)

    # Return only level-1 subsystems (children of S0)
    return [s for s in subsystems.values() if s.level == 1 and s.parent_id == "S0"]


def extract_flows(model: Dict[str, Any]) -> List[Flow]:
    """Extract internal flows (level >= 0) from BERT model."""
    flows = []

    for interaction in model.get('interactions', []):
        info = interaction.get('info', {})
        level = info.get('level', -1)

        # Only include internal flows (level >= 0)
        if level < 0:
            continue

        flow = Flow(
            id=info.get('id', ''),
            name=info.get('name', ''),
            source_id=interaction.get('source', ''),
            sink_id=interaction.get('sink', ''),
            substance_type=interaction.get('substance', {}).get('type', ''),
            usability=interaction.get('usability', ''),
        )
        flows.append(flow)

    return flows


def load_bitcoin_bert(json_path: str) -> Dict[str, Any]:
    """
    Load and parse Bitcoin BERT model for ABM use.

    Returns:
        Complete structure for API response
    """
    model = load_bert_model(json_path)
    subsystems = extract_subsystems(model)
    hierarchy = build_hierarchy(subsystems)
    flows = extract_flows(model)

    # Find root system (S0)
    root = subsystems.get('S0')

    return {
        "root": {
            "id": root.id if root else "S0",
            "name": root.name if root else "Bitcoin",
            "description": root.description[:300] if root else "",
        },
        "subsystems": [s.to_dict() for s in hierarchy],
        "flows": [f.to_dict() for f in flows],
        "archetype_legend": {
            k: {"color": v["color"], "decision_style": v["decision_style"]}
            for k, v in ARCHETYPE_BEHAVIORS.items()
            if k is not None
        },
        "stats": {
            "total_subsystems": len(subsystems),
            "total_flows": len(flows),
            "depth": max((s.level for s in subsystems.values()), default=0),
        },
    }


# =============================================================================
# CLI Test
# =============================================================================

if __name__ == "__main__":
    import sys

    # Default to BERT examples path
    default_path = "/Users/home/Desktop/halcyonic-projects/active/bert/assets/models/examples/bitcoin.json"
    json_path = sys.argv[1] if len(sys.argv) > 1 else default_path

    print(f"Loading BERT model from: {json_path}\n")

    try:
        result = load_bitcoin_bert(json_path)

        print(f"Root: {result['root']['name']}")
        print(f"Stats: {result['stats']}")
        print(f"\nLevel-1 Subsystems:")

        for sub in result['subsystems']:
            arch = sub['archetype'] or 'None'
            print(f"  {sub['name']} [{sub['complexity']}] ({arch})")
            for child in sub.get('children', []):
                c_arch = child['archetype'] or 'None'
                print(f"    └─ {child['name']} [{child['complexity']}] ({c_arch})")

        print(f"\nInternal Flows ({len(result['flows'])}):")
        for flow in result['flows'][:5]:
            print(f"  {flow['name']}: {flow['source_id']} → {flow['sink_id']}")

    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)
