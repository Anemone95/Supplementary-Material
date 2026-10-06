import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin';
import MongoDbPasswordConfig from './MongoDbPasswordConfig';
import MongoDbSessionConfig from './MongoDbSessionConfig';
import LegacyLdapConfig from './LegacyLdapConfig';
import RootUserConfig from './RootUserConfig';
import AccessTokenConfig from './AccessTokenConfig';

PluginStore.register(new PluginManifest({}, {
  authenticatorConfigurations: [
    {
      name: 'mongodb-password',
      displayName: '密码',
      description: 'Graylog管理帐户密码（来自MongoDB）',
      canBeDisabled: true,
      component: MongoDbPasswordConfig,
    },
    {
      name: 'mongodb-session',
      displayName: '会话',
      description: '建立会话认证',
      canBeDisabled: false,
      component: MongoDbSessionConfig,
    },
    {
      name: 'legacy-ldap',
      displayName: 'LDAP/Active Directory',
      description: '通过外部系统进行身份验证，并在Graylog中创建帐户',
      canBeDisabled: true,
      component: LegacyLdapConfig,
    },
    {
      name: 'root-user',
      displayName: '管理员用户',
      description: '在服务器配置文件中配置静态帐户',
      canBeDisabled: false,
      component: RootUserConfig,
    },
    {
      name: 'access-token',
      displayName: 'API令牌',
      description: '不建立会话每个用户令牌',
      canBeDisabled: true,
      component: AccessTokenConfig,
    },
  ],
}));
