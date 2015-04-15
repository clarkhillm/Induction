/**
 *
 * Created by gavin on 2015/4/14.
 */

induction.core.config = {
    basePath: '/js',
    logLevel: 'DEBUG'
};

induction.modules = ['main', 'common.test'];

/**
 * 入口模块
 *
 *
 */
induction.entrance = {module: 'induction.main', method: 'execute'};
