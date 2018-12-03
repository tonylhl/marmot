'use strict';

require('es6-promise').polyfill();
const fetch = require('isomorphic-fetch');

const {
  Controller,
} = require('egg');

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;

}

function parseJSON(response) {
  return response.json();
}

module.exports = class PublishController extends Controller {
  async getGitlabToken() {
    const config = await this.ctx.model.Config.findOne();
    if (config) {
      this.ctx.success(config.data.gitlab.private_token);
    } else {
      this.ctx.logger.info(`PublishController fetch data from config fail:${config}`);
      this.ctx.success();
    }
  }

  async getGroups() {

    const config = await this.ctx.model.Config.findOne();
    const gitlabApi = config.data.gitlab.gitlab_api;
    const token = config.data.gitlab.private_token;

    const repos = await fetch(`${gitlabApi}/groups`, {
      headers: { 'PRIVATE-TOKEN': token },
    })
      .then(checkStatus)
      .then(parseJSON);

    this.ctx.success(repos);
  }

  async getProjects() {
    const groupId = this.ctx.query.groupId;
    const config = await this.ctx.model.Config.findOne();
    const gitlabApi = config.data.gitlab.gitlab_api;
    const token = config.data.gitlab.private_token;

    const projects = await fetch(`${gitlabApi}/groups/${groupId}/projects`, {
      headers: { 'PRIVATE-TOKEN': token },
    })
      .then(checkStatus)
      .then(parseJSON);

    this.ctx.success(projects);
  }

  async createRepo() {
    const {
      groupName, repoName, memo, repoId,
    } = this.ctx.request.body;

    console.log(groupName, repoName, memo, repoId);

    const payload = {
      repoUrl: '',
      groupName,
      repoName,
      memo,
      repoId,
    };

    const result = await this.ctx.model.Repo.create(payload);
    this.ctx.success(result);
  }

  async getRepos() {
    const result = await this.ctx.model.Repo.findAll();
    this.ctx.success(result);
  }

  async createBranch() {
    const config = await this.ctx.model.Config.findOne();
    const gitlabApi = config.data.gitlab.gitlab_api;
    const token = config.data.gitlab.private_token;

    let {
      groupName,
      repoName,
      branchName,
      memo,
      /* dev/release*/
      branchType,
      baseBranchName,
    } = this.ctx.request.body;

    const { repoId } = await this.ctx.model.Repo.findOne({
      where: {
        groupName,
        repoName,
      },
    });

    baseBranchName = baseBranchName || 'master';
    const s = `${gitlabApi}/projects/${repoId}/repository/branches?branch=${branchName}&ref=${baseBranchName}`;
    console.log(s);

    await fetch(s, {
      headers: { 'PRIVATE-TOKEN': token },
      method: 'POST',
    })
      .then(checkStatus)
      .then(parseJSON);

    const payload = {
      groupName,
      repoName,
      branchName,
      status: 'normal',
      memo,
      branchType,
      baseBranchName,
    };

    const result = await this.ctx.model.Branch.create(payload);
    this.ctx.success(result);
  }

  async getBranches() {
    const groupName = this.ctx.query.groupName;
    const repoName = this.ctx.query.repoName;
    const baseBranchName = this.ctx.query.baseBranchName || 'master';
    const queryResult = await this.ctx.model.Branch.findAll({
      where: {
        groupName, repoName, baseBranchName,
      },
      order: [
        [
          'createdAt',
          'DESC',
        ],
      ],
      attributes: [
        'branchName', 'baseBranchName', 'branchType',
      ],
    });
    this.ctx.success(queryResult);
  }

  async deleteRepo() {

    const { groupName, repoName } = this.ctx.request.query;
    let transaction;
    try {
      transaction = await this.ctx.model.transaction();
      await this.ctx.model.Repo.destroy({
        where: {
          groupName,
          repoName,
        },
      });
      const result = await this.ctx.model.Branch.destroy({
        where: {
          groupName,
          repoName,
        },
      });

      this.ctx.success(result);

    } catch (e) {
      await transaction.rollback();
      this.ctx.logger.error(e);
      this.ctx.fail('delete error');
    }
  }
};
