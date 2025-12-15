# coding: utf-8
#
# Copyright 2024 The Oppia Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""Services for card-level progress tracking and learning path management."""

from __future__ import annotations

from core.domain import card_progress_domain, exp_fetchers

from typing import Any, Dict, List, Optional, Set


# Here we use type Any because the card dictionaries can contain
# various types of nested data structures from different domain objects.
def get_learning_path_cards(
    exploration_id: str, user_id: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Get the ordered sequence of cards in the learning path for an exploration.

    This traverses the exploration's state graph starting from the init state
    and builds an ordered list of cards/states that make up the learning path.

    Args:
        exploration_id: str. The ID of the exploration.
        user_id: str|None. The ID of the user (if logged in).

    Returns:
        list(dict). A list of card dictionaries with metadata and progress.

    Raises:
        Exception. If the exploration is not found.
    """
    exploration = exp_fetchers.get_exploration_by_id(exploration_id)

    cards = []
    current_state_name = exploration.init_state_name
    visited_states: Set[str] = set()

    # Traverse the state graph to build card sequence.
    while current_state_name and current_state_name not in visited_states:
        state = exploration.states[current_state_name]

        # Determine card status based on progress.
        if user_id:
            # TODO: Fetch actual progress from storage.
            status = _determine_card_status(
                len(cards), user_id, exploration_id, current_state_name
            )
        else:
            status = 'upcoming' if len(cards) > 0 else 'current'

        # Create learning path card.
        card = card_progress_domain.LearningPathCard(
            state_name=current_state_name,
            display_order=len(cards) + 1,
            card_title=_get_state_title(state),
            card_type='checkpoint' if state.card_is_checkpoint else 'standard',
            status=status,
            interaction_id=state.interaction.id if state.interaction else None,
        )

        cards.append(card.to_dict())
        visited_states.add(current_state_name)

        # Get next state from default outcome.
        current_state_name = _get_next_state_name(state)

    return cards


# Here we use type Any because the State class is defined in a different
# module and using the actual type would create circular dependencies.
def _get_state_title(state: Any) -> str:
    """Extract a display title from the state.

    Args:
        state: State. The state domain object.

    Returns:
        str. The state name as title.
    """
    # For now, use state name as title.
    # Could be enhanced to extract from state content.
    return state.name


# Here we use type Any because the State class is defined in a different
# module and using the actual type would create circular dependencies.
def _get_next_state_name(state: Any) -> Optional[str]:
    """Get the next state name from the state's default outcome.

    Args:
        state: State. The state domain object.

    Returns:
        str|None. The next state name, or None if this is the end.
    """
    if state.interaction and state.interaction.default_outcome:
        dest = state.interaction.default_outcome.dest
        # Check if dest is the END state.
        if dest and dest != state.name:
            return dest
    return None


def _determine_card_status(
    card_index: int,
    user_id: str,  # pylint: disable=unused-argument
    exploration_id: str,  # pylint: disable=unused-argument
    state_name: str,  # pylint: disable=unused-argument
) -> str:
    """Determine the status of a card based on user progress.

    Args:
        card_index: int. The index of this card in the sequence.
        user_id: str. The ID of the user.
        exploration_id: str. The ID of the exploration.
        state_name: str. The name of the state.

    Returns:
        str. One of 'completed', 'current', or 'upcoming'.
    """
    # TODO: Query actual progress from storage.
    # For now, return status based on position.
    if card_index == 0:
        return 'completed'
    elif card_index == 1:
        return 'current'
    else:
        return 'upcoming'


# Here we use type Any because the card details dictionary can contain
# various types of nested data structures from different domain objects.
def get_card_details(
    exploration_id: str, state_name: str, user_id: Optional[str] = None
) -> Dict[str, Any]:
    """Get detailed information about a specific card in the learning path.

    Args:
        exploration_id: str. The ID of the exploration.
        state_name: str. The name of the state/card.
        user_id: str|None. The ID of the user (if logged in).

    Returns:
        dict. Card details including interaction data and progress.

    Raises:
        Exception. If the exploration or state is not found.
    """
    exploration = exp_fetchers.get_exploration_by_id(exploration_id)

    if state_name not in exploration.states:
        raise Exception(f'State {state_name} not found in exploration')

    state = exploration.states[state_name]

    # Build card details.
    card_details = {
        'state_name': state_name,
        'content': state.content.to_dict(),
        'interaction': None,
        'progress': None,
    }

    # Add interaction details if present.
    if state.interaction:
        card_details['interaction'] = {
            'id': state.interaction.id,
            'customization_args': state.interaction.customization_args,
            'answer_groups': [
                group.to_dict() for group in state.interaction.answer_groups
            ],
            'default_outcome': (
                state.interaction.default_outcome.to_dict()
                if state.interaction.default_outcome
                else None
            ),
            'hints': [hint.to_dict() for hint in state.interaction.hints],
            'solution': (
                state.interaction.solution.to_dict()
                if state.interaction.solution
                else None
            ),
        }

    # Add progress if user is logged in.
    if user_id:
        # TODO: Fetch actual progress from storage.
        card_details['progress'] = {
            'visited': False,
            'completed': False,
            'attempts': 0,
            'hints_used': 0,
        }

    return card_details


def record_card_visit(
    user_id: str,  # pylint: disable=unused-argument
    exploration_id: str,  # pylint: disable=unused-argument
    state_name: str,  # pylint: disable=unused-argument
) -> None:
    """Record that a user has visited a card.

    Args:
        user_id: str. The ID of the user.
        exploration_id: str. The ID of the exploration.
        state_name: str. The name of the state/card.
    """
    # TODO: Implement storage update.
    pass


def record_card_completion(
    user_id: str,  # pylint: disable=unused-argument
    exploration_id: str,  # pylint: disable=unused-argument
    state_name: str,  # pylint: disable=unused-argument
) -> None:
    """Record that a user has completed a card.

    Args:
        user_id: str. The ID of the user.
        exploration_id: str. The ID of the exploration.
        state_name: str. The name of the state/card.
    """
    # TODO: Implement storage update.
    pass
