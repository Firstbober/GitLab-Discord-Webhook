# GitLab Discord Webhook
A highly configurable and self-hosted webhook for GitLab and Discord.

## What has already been done
- [X] Push event
- [X] Issue events
- [X] Merge requests events
- [ ] Comments events
- [ ] Pipelines events
- [ ] Job events
- [ ] Wiki page events

## Installation
Dependences:
- NodeJS ^11
- Discord.JS
- Express
- Body-Parser

To run webhook you need to clone the repository and run the command `npm install` and `npm start`. Webhook should start on port 7080.

The entire configuration is in the `config.json` file.