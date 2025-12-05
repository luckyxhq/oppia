# [Oppia](https://www.oppia.org) [![Full-stack tests](https://github.com/oppia/oppia/actions/workflows/full_stack_tests.yml/badge.svg)](https://github.com/oppia/oppia/actions/workflows/full_stack_tests.yml)

Oppia is an online learning tool that enables anyone to easily create and share interactive activities (called 'explorations'). These activities simulate a one-on-one conversation with a tutor, enabling students to learn by doing while getting feedback.

In addition to developing the Oppia platform, the team has developed free and effective [lessons](https://www.oppia.org/fractions) on basic mathematics, and we are planning to expand our educational offering to basic science and financial literacy. These lessons help learners who lack appropriate access to educational resources.

The Oppia web application is built using Python, Angular, and Google App Engine. See also:

- [Oppia.org community site](https://www.oppia.org)
- [User Documentation](https://oppia.github.io/)
- [Contributors' wiki](https://github.com/oppia/oppia/wiki)
- [GitHub Discussions](https://github.com/oppia/oppia/discussions)
- [File an issue](https://github.com/oppia/oppia/issues/new/choose)

You can also sign up to our [email newsletter](https://shorturl.at/CHPY6) for news and updates about the Oppia project.

<p align="center">
  <a href="http://www.youtube.com/watch?v=Ntcw0H0hwPU" target="_blank" rel="noopener">
    <img src="https://user-images.githubusercontent.com/30050862/228266651-1270bedc-658a-40d8-8ab4-16b63de4deaf.png">
  </a>
</p>

## Installation

Please refer to the [Installing Oppia page](https://github.com/oppia/oppia/wiki/Installing-Oppia) for full instructions.

## Contributing

The Oppia project is built by the community for the community. We welcome contributions from everyone, especially new contributors.

You can help with Oppia's development in many ways, including art, coding, design and documentation.

- **Developers**: please see [this wiki page](https://github.com/oppia/oppia/wiki/Contributing-code-to-Oppia#setting-things-up) for instructions on how to set things up and commit changes.
- **All other contributors**: please see our [general contributor guidelines](https://github.com/oppia/oppia/wiki).

If you'd like to donate to support our work, you can do so [here](https://www.oppia.org/donate).

## Support

If you have any feature requests or bug reports, please log them on our [issue tracker](https://github.com/oppia/oppia/issues/new/choose).

Please report security issues directly to admin@oppia.org.

## License

The Oppia code is released under the [Apache v2 license](https://github.com/oppia/oppia/blob/develop/LICENSE).

## Keeping in touch

- [Discussion forum](https://github.com/oppia/oppia/discussions)
- [Announcements mailing list](http://groups.google.com/group/oppia-announce)

## Social Media

[<img height="30" src="https://img.shields.io/badge/twitter-1DA1F2.svg?&style=for-the-badge&logo=twitter&logoColor=white" />][twitter] [<img height="30" src="https://img.shields.io/badge/linkedin-0077B5.svg?&style=for-the-badge&logo=linkedin&logoColor=white" />][LinkedIn] [<img height="30" src = "https://img.shields.io/badge/facebook-1877F2.svg?&style=for-the-badge&logo=facebook&logoColor=white">][Facebook] [<img height="30" src = "https://img.shields.io/badge/medium-12100E.svg?&style=for-the-badge&logo=medium&logoColor=white">][medium] [<img height="30" src = "https://img.shields.io/badge/oppia.org%20youtube-FF0000.svg?&style=for-the-badge&logo=youtube&logoColor=white">][oppia-org-youtube] [<img height="30" src = "https://img.shields.io/badge/oppia%20dev%20youtube-FF0000.svg?&style=for-the-badge&logo=youtube&logoColor=white">][dev-youtube]

[twitter]: https://twitter.com/oppiaorg
[linkedIn]: https://www.linkedin.com/company/oppia-org/
[medium]: https://medium.com/@oppia.org
[facebook]: https://www.facebook.com/oppiaorg/
[oppia-org-youtube]: https://www.youtube.com/channel/UC5c1G7BNDCfv1rczcBp9FPw
[dev-youtube]: https://www.youtube.com/channel/UCsrAX-oeqm0-NIQzQrdiUkQ

# Improved Lesson Editor UI - Project Documentation

## 1. Service Documentation

### Frontend Services

- **Location:** `core/templates/services/`
  - `exploration-data.service.ts` – loads and manages exploration editor state
  - `autosave-draft.service.ts` – handles auto-saving lesson drafts
  - `editor-state.service.ts` – manages UI state and editor tab interactions

### Frontend Key Files/Folders

- `core/templates/pages/exploration-editor-page/editor-tab/` – main editor components for states, interactions, and answer groups
- `core/templates/pages/exploration-editor-page/settings-tab/` – exploration metadata (title, category, goal)
- `core/templates/domain/exploration/` – frontend models for explorations

### Backend Controllers & Services

- **Controller:** `core/controllers/editor.py`

  - Handles GET/PUT requests for loading and saving explorations
  - Validates user permissions and exploration state

- **Service:** `core/domain/exp_services.py`

  - `update_exploration()` – saves edited exploration with version control
  - `publish_exploration()` – publishes lesson for learners

- **Domain Model:** `core/domain/exp_domain.py`

  - Exploration domain validation and business logic

- **Database Model:** `ExplorationModel` in `core/storage/exploration/`
  - Persists exploration content and version history

---

## 2. Data Flow Diagram

### Scenario: Creator Edits & Saves Lesson

```
User (Lesson Creator)
    ↓ clicks "Save" in improved UI
Frontend (Exploration Editor Page)
    ↓ PUT /exploration/<exp_id>
Backend Controller (editor.py)
    ↓ validates request & calls
Service Layer (exp_services.update_exploration)
    ↓ loads domain & increments version
Database (ExplorationModel)
    ↓ stores updated exploration & version record
Service Layer
    ↓ returns updated data
Backend Controller
    ↓ sends JSON response
Frontend (updates editor state)
    ↓ shows "Saved" success message & displays latest content
User sees updated lesson
```

---

## 3. Recent Merged PRs

### PR #23783 – Fix #23686: Unexpected Page Scroll in Exploration Editor

- **Branch:** `PrietMax85:tour-scroll-bug`
- **Commits:** 4 commits
- **Changes:**
  - Fixed scrolling bug in Exploration Editor Tour and Translation Tour
  - Applied smooth scrolling logic to `startTutorial()` functions for both tours
  - Improved user experience during guided tutorials at different zoom levels
- **Files Changed:** 4

### PR #23676 – Fix #22473, #22563, #18366: Image Disappearance & Save Button Issues

- **Branch:** `NITISH084:image-disappearance`
- **Status:** Merged (3 weeks ago)
- **Commits:** 5 commits
- **Changes:**
  - Fixed race condition in `SchemaBased HtmlEditorComponent` where uploaded images were missing when saving
  - Resolved save button visibility flakiness in lesson editor
  - Fixed Node outline save button display issues
- **Files Changed:** 3

### PR #23783 (Related) – Additional Exploration Editor UI Improvements

- **Commits:** Multiple fixes for editor responsiveness and visual consistency
- **Scope:** Scrolling, image handling, and save button state management

---

## Summary

These three PRs enhance the **Exploration Editor UI** by fixing critical UX bugs:

1. **Smooth scrolling** during tutorials
2. **Image persistence** during save operations
3. **Save button visibility** consistency

The improvements follow the standard Oppia architecture: frontend Angular services communicate with Python backend controllers, which update domain models and persist changes to the datastore.
