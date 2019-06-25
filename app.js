const Discord = require("discord.js");
const express = require('express');
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());
const config = require("./config.json");
// [x_gitlab_token] = [webhook_id : webhook_token]
var WebhooksData = [];

config.gitlab_webhooks.forEach(wh => {
    var links = [];
    wh.discord_webhooks.forEach(link => {
        var linkSplited = link.split("/");
        links.push({ "W_ID": linkSplited[5], "W_TKN": linkSplited[6] });
    });
    WebhooksData.push({ "GITLAB_TOKEN": wh.x_gitlab_token, "DISCORD_WEBHOOKS": links });
});

WebhooksData.forEach(data => {
    console.log(data);
});

function send_push_to_discord(body, legitWebhook) {
    const embed = new Discord.RichEmbed()
        .setColor('#C86C00')
        .setTitle(`[${body.project.namespace}/${body.project.name}] ${body.commits.length} new commit/s`)
        .setURL(body.project.web_url)
        .setAuthor(body.user_username, body.user_avatar, `https://gitlab.com/${body.user_username}`)
        .setTimestamp()
        .setFooter("GitLab Discord Webhook", "https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png");

    for (var i in body.commits) {
        if (body.commits[i].message[body.commits[i].message.length] == "\n") {
            embed.addField('`' + body.commits[i].id.substring(0, 8) + '`:', `${body.commits[i].message.substring(0, body.commits[i].message.length - 1)} - ${body.commits[i].author.name}`, false);
        } else {
            embed.addField('`' + body.commits[i].id.substring(0, 8) + '`:', `${body.commits[i].message} - ${body.commits[i].author.name}`, false)
        }
    }

    console.log(body.commits[0].author);

    legitWebhook.DISCORD_WEBHOOKS.forEach(hookData => {
        var webhook = new Discord.WebhookClient(hookData.W_ID, hookData.W_TKN);
        webhook.send(embed);
    });
}

function send_issue_to_discord(body, legitWebhook) {
    const embed = new Discord.RichEmbed()
        .setURL(body.object_attributes.url)
        .setAuthor(body.user.username, body.user.avatar_url, `https://gitlab.com/${body.user.username}`)
        .setTimestamp()
        .setFooter("GitLab Discord Webhook", "https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png");

    var title;
    var color = "a2c600";
    if (body.object_attributes.action == "open") {
        var createDate = new Date(body.object_attributes.created_at);
        title = `[${body.project.namespace}/${body.project.name}] Issue opened: #${body.object_attributes.iid} ${body.object_attributes.title}`;
        embed.addField(`\`Created at: ${createDate.toUTCString()} \``, body.object_attributes.description);
    } else if (body.object_attributes.action == "reopen") {
        var updateDate = new Date(body.object_attributes.updated_at);
        color = "c6af00";
        title = `[${body.project.namespace}/${body.project.name}] Issue reopened: #${body.object_attributes.iid} ${body.object_attributes.title}`;
        embed.addField(`\`Issue reopened at: ${updateDate.toUTCString()} \``, body.object_attributes.description);
    } else if (body.object_attributes.action == "close") {
        var updateDate = new Date(body.object_attributes.updated_at);
        color = "48c600";
        title = `[${body.project.namespace}/${body.project.name}] Issue closed: #${body.object_attributes.iid} ${body.object_attributes.title}`;
        embed.addField(`\`Issue closed at: ${updateDate.toUTCString()} \``, body.object_attributes.description);
    } else if (body.object_attributes.action == "update") {
        var updateDate = new Date(body.object_attributes.updated_at);
        color = "00c66a";
        title = `[${body.project.namespace}/${body.project.name}] Issue updated: #${body.object_attributes.iid} ${body.object_attributes.title}`;
        embed.addField(`\`Issue updated at: ${updateDate.toUTCString()} \``, body.object_attributes.description);
    }
    embed.setTitle(title);
    embed.setColor(color);

    legitWebhook.DISCORD_WEBHOOKS.forEach(hookData => {
        var webhook = new Discord.WebhookClient(hookData.W_ID, hookData.W_TKN);
        webhook.send(embed);
    });
}

function send_merge_request_to_discord(body, legitWebhook) {
    const embed = new Discord.RichEmbed()
        .setURL(body.object_attributes.url)
        .setAuthor(body.user.username, body.user.avatar_url, `https://gitlab.com/${body.user.username}`)
        .setTimestamp()
        .setFooter("GitLab Discord Webhook", "https://about.gitlab.com/images/press/logo/png/gitlab-icon-rgb.png");

    var title;
    var color = "5c00c6";
    if (body.object_attributes.action == "open") {
        var updateDate = new Date(body.object_attributes.updated_at);
        title = `[${body.project.namespace}/${body.project.name}] Merge request opened: #${body.object_attributes.iid} ${body.object_attributes.title}`;
        embed.addField(`\`Merge request opened at: ${updateDate.toUTCString()} \``, body.object_attributes.description);
        embed.addField(`\`Source branch: ${body.object_attributes.source_branch} \``, `Target branch: \`${body.object_attributes.target_branch} \``);
        if(body.object_attributes.merge_status == "can_be_merged") {
            embed.addField("`Merge status: `", "Can be merged", true);
        }
    } else if (body.object_attributes.action == "reopen") {
        var updateDate = new Date(body.object_attributes.updated_at);
        color = "9100c6";
        title = `[${body.project.namespace}/${body.project.name}] Merge request reopened: #${body.object_attributes.iid} ${body.object_attributes.title}`;
        embed.addField(`\`Merge request reopened at: ${updateDate.toUTCString()} \``, body.object_attributes.description);
        embed.addField(`\`Source branch: ${body.object_attributes.source_branch} \``, `Target branch: \`${body.object_attributes.target_branch} \``);
        if(body.object_attributes.merge_status == "can_be_merged") {
            embed.addField("`Merge status: `", "Can be merged", true);
        }
    } else if (body.object_attributes.action == "close") {
        var updateDate = new Date(body.object_attributes.updated_at);
        color = "c600c3";
        title = `[${body.project.namespace}/${body.project.name}] Merge request closed: #${body.object_attributes.iid} ${body.object_attributes.title}`;
        embed.addField(`\`Merge reqest closed at: ${updateDate.toUTCString()} \``, body.object_attributes.description);
    } else if (body.object_attributes.action == "update") {
        var updateDate = new Date(body.object_attributes.updated_at);
        color = "c60084";
        title = `[${body.project.namespace}/${body.project.name}] Merge request updated: #${body.object_attributes.iid} ${body.object_attributes.title}`;
        embed.addField(`\`Merge request updated at: ${updateDate.toUTCString()} \``, body.object_attributes.description);
        embed.addField(`\`Source branch: ${body.object_attributes.source_branch} \``, `Target branch: \`${body.object_attributes.target_branch} \``);
        if(body.object_attributes.merge_status == "can_be_merged") {
            embed.addField("`Merge status: `", "Can be merged", true);
        }
    }
    embed.setTitle(title);
    embed.setColor(color);

    legitWebhook.DISCORD_WEBHOOKS.forEach(hookData => {
        var webhook = new Discord.WebhookClient(hookData.W_ID, hookData.W_TKN);
        webhook.send(embed);
    });
}

app.post('/', (req, res) => {
    var isTokenLegit = false;
    var requestedGitLabIntegration;
    WebhooksData.forEach(data => {
        if (req.header("X-Gitlab-token") == data.GITLAB_TOKEN) {
            isTokenLegit = true;
            requestedGitLabIntegration = data;
        }
    })

    if (!isTokenLegit) {
        console.log(`[GitLab Discord Webhook] ${req.ip} tried to connected with invalid token`);
        return res.sendStatus(401);
    }

    res.sendStatus(200);

    console.log(req.body);
    console.log(req.header("X-Gitlab-Event"));

    switch (req.header("X-Gitlab-Event")) {
        case "Push Hook":
            send_push_to_discord(req.body, requestedGitLabIntegration);
            break;

        case "Issue Hook":
            send_issue_to_discord(req.body, requestedGitLabIntegration);
            break;

        case "Merge Request Hook":
            send_merge_request_to_discord(req.body, requestedGitLabIntegration);
            break;

        default:
            break;
    }
});

app.listen(config.port, () => {
    console.log(`[GitLab Discord Webhook] Server started at port ${config.port}`);
})