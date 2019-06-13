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

  log(stringLog) {
    this.serverless.cli.log(stringLog);
  }

  async execute(_command, project) {
    const options = {
      cwd: project.path
    };

    this.log(`Started sls ${_command} on ${project.name}`);

    // const { stdout, stderr } = await exec(`ls`);

    const { stdout, stderr } = await exec("find . -type f | wc -l");
    if (stderr) {
      this.log(`stderr: ${stderr}`);
    }

    this.log(`Working dir ${project.path}:${_command}:${stdout}`);

    this.log(`Finished sls ${_command} on ${Object.keys(project)[0]}`);
  }
}

module.exports = MaestroPlugin;
