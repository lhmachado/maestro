"use strict";
const paths = require("path");
const { execSync } = require("child_process");

class MaestroPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.maestro = serverless.service.custom.maestro;
    this.serverlessLog = serverless.cli.log.bind(serverless.cli);

    this.stdin = process.stdin;
    this.stdout = process.stdout;
    this.stderr = process.stderr;

    this.commands = {
      maestro: {
        usage: 'Just run "sls maestro play" ',
        commands: {
          play: {
            lifecycleEvents: ["run"],
            usage: "Just play"
          }
        }
      }
    };

    this.hooks = {
      "maestro:play:run": this.run.bind(this)
    };
  }

  clone(repoPath) {
    const simpleGit = require("simple-git")(__dirname);
    simpleGit.clone(repoPath);
    this.serverless.cli.log("cloned");
  }
  cloneProject() {
    const simpleGit = require("simple-git")(__dirname);
    simpleGit.clone(project.git);
    let start = project.git.lastIndexOf("/") + 1;
    let final = project.git.lastIndexOf(".");
    let repoName = project.git.slice(start, final);
    console.log(repoName);
    project.path = __dirname + "/" + repoName;
    console.log(project.path);
  }

  run() {
    this.maestro.forEach(object => {
      Object.keys(object).forEach(key => {
        let project = object[key];
        project.name = key;
        if (project.git) {
          cloneProject();
        }
        this.runCommand(project);
      });
    });
  }

  runCommand(project) {
    const { name, path, command, params } = project;

    this.serverlessLog(
      `##############################################################`
    );
    this.serverlessLog(`Maestro is playing "${command}" on "${name}"`);
    execSync(`${command} -v`, {
      stdio: [this.stdin, this.stdout, this.stderr],
      cwd: paths.resolve(path)
    });

    this.serverlessLog(`Maestro ended "${command}" on "${name}"`);
    this.serverlessLog(
      `##############################################################`
    );
  }
}

module.exports = MaestroPlugin;
