"use strict";

const util = require("util");
const exec = util.promisify(require("child_process").exec);

class MaestroPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.maestro = serverless.service.custom.maestro;

    this.commands = {
      maestro: {
        usage:
          "Need a maestro for your serverless orchest ? type maestro deploy",
        commands: {
          deploy: {
            lifecycleEvents: ["execute"]
          }
        }
      }
    };

    this.hooks = {
      "maestro:deploy:execute": this.deploy.bind(this)
    };
  }

  clone(repoPath) {
    const simpleGit = require("simple-git")(__dirname);
    simpleGit.clone(repoPath);
    this.serverless.cli.log("cloned");
  }

  deploy() {
    this.maestro.forEach(object => {
      Object.keys(object).forEach(key => {
        let projectName = key;
        let project = object[key];
        project.name = key;
        if (project.git) {
          const simpleGit = require("simple-git")(__dirname);
          simpleGit.clone(project.git);
          let start = project.git.lastIndexOf("/") + 1;
          let final = project.git.lastIndexOf(".");
          let repoName = project.git.slice(start, final);
          console.log(repoName);
          project.path = __dirname + "/" + repoName;
          console.log(project.path);
        }
        this.execute("package", project);
      });
    });
  }

  async execute(_command, project) {
    const options = {
      cwd: project.path
    };

    this.serverless.cli.log(`Started sls ${_command} on ${project.name}`);
    const { stdout, stderr } = await exec(`sls ${_command}`, options);
    if (stdout) {
      this.serverless.cli.log(
        `Working dir ${project.path}:${_command}:${stdout}`
      );
    } else {
      this.serverless.cli.log("stderr:", stderr);
    }
    this.serverless.cli.log(
      `Finished sls ${_command} on ${Object.keys(project)[0]}`
    );
  }
}

module.exports = MaestroPlugin;
