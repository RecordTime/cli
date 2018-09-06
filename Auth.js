/**
 * @file 注册登录
 * @author ltaoo
 */
const AV = require('leanengine');
const inquirer = require('inquirer');

/**
 * 登录
 */
module.exports.login = async function login() {
  try {
    const { username } = await inquirer.prompt([{
      type: 'input',
      // 显示的文案
      message: 'Username',
      // 返回的字段 key
      name: 'username',
    }]);
    const { password } = await inquirer.prompt([{
      type: 'password',
      message: 'Password',
      name: 'password'
    }]);
    console.log(username, password);
    // 调用登录方法去登录
    const loginedUser = await AV.User.logIn(username, password);
    console.log(loginedUser);
  } catch (err) {
    console.log(err);
  }
}

/**
 * 注册
 */
module.exports.register = async function register() {
  try {
    const { username } = await inquirer.prompt([{
      type: 'input',
      // 显示的文案
      message: 'Username',
      // 返回的字段 key
      name: 'username',
    }]);
    const { email } = await inquirer.prompt([{
      type: 'input',
      message: 'Email',
      name: 'email'
    }]);
    const { password } = await inquirer.prompt([{
      type: 'password',
      message: 'Password',
      name: 'password'
    }]);
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    user.setEmail(email);
    const loginedUser = await user.signUp();
    console.log('Login success !');
  } catch (err) {
    console.log(err);
  }
}
