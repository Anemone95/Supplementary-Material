/* eslint-disable react/no-unescaped-entities, no-template-curly-in-string */
import React from 'react';
import {Alert, Col, Row} from 'react-bootstrap';

const HTTPJSONPathAdapterDocumentation = () => {
  const exampleJSON = `{
  "user": {
    "login": "jane",
    "full_name": "Jane Doe",
    "roles": ["admin", "developer"],
    "contact": {
      "email": "jane@example.com",
      "cellphone": "+49123456789"
    }
  }
}`;
  const noMultiResult = '{"value": "Jane Doe"}';
  const mapResult = `{
  "login": "jane",
  "full_name": "Jane Doe",
  "roles": ["admin", "developer"],
  "contact": {
    "email": "jane@example.com",
    "cellphone": "+49123456789"
  }
}`;
  const smallMapResult = `{
  "email": "jane@example.com",
  "cellphone": "+49123456789"
}`;
  const listResult = `{
  "value": ["admin", "developer"]
}`;
  const pipelineRule = `rule "lookup user"
when has_field("user_login")
then
  // Get the user login from the message
  let userLogin = to_string($message.user_login);
  // Lookup the single value, in our case the full name, in the user-api lookup table
  let userName = lookup_value("user-api", userLogin);
  // Set the field "user_name" in the message
  set_field("user_name", userName)
  
  // Lookup the multi value in the user-api lookup table
  let userData = lookup("user-api", userLogin);
  // Set the email and cellphone as fields in the message
  set_field("user_email", userData["email"]);
  set_field("user_cellphone", userData["cellphone"]);
end`;

  return (<div>
    <p>
      HTTPJSONPath数据适配器执行<em>HTTP GET</em>请求来查找键并根据配置的JSONPath表达式解析结果。
    </p>

    <Alert style={{ marginBottom: 10 }} bsStyle="info">
      每个查找表结果都有两个值。一个<em>单值</em>和一个<em>多值</em>。T当查找结果预期为字符串，数字或布尔值时，将使用单值。 当查找结果预期为映射或列表时，将使用多值。
    </Alert>

    <h3 style={{ marginBottom: 10 }}>配置</h3>

    <h5 style={{ marginBottom: 10 }}>查找URL</h5>
    <p style={{ marginBottom: 10, padding: 0 }}>
      将用于HTTP请求的URL。 要在URL中使用<em>查找键</em>, 可以使用
      <code>{'${key}'}</code>
      值。该变量将被传递给查找函数的实际键替换。 <br/>
      (例如: <code>{'https://example.com/api/lookup?key=${key}'}</code>)
    </p>

    <h5 style={{ marginBottom: 10 }}>单值JSONPath</h5>
    <p style={{ marginBottom: 10, padding: 0 }}>
      此JSONPath表达式将用于解析查找结果的<em>单值</em>。
      (例如: <code>$.user.full_name</code>)
    </p>

    <h5 style={{ marginBottom: 10 }}>多值JSONPath</h5>
    <p style={{ marginBottom: 10, padding: 0 }}>
      此JSONPath表达式将用于解析查找结果的<em>多值</em>。
      (例如: <code>$.users[*]</code>)
      多值JSONPath设置是<em>可选的</em>。没有它，单值也存在于多值结果中。
    </p>

    <h5 style={{ marginBottom: 10 }}>HTTP用户代理</h5>
    <p style={{ marginBottom: 10, padding: 0 }}>
      这是将用于HTTP请求的<em>用户代理</em>标头。您应该包含一些
      联系人详细信息，以便在发生问题时您查询的服务的所有者知道与谁联系。
      (例如来自您的Graylog集群的过多的API请求)
    </p>

    <hr />

    <h3 style={{ marginBottom: 10 }}>示例</h3>
    <p>
      这显示了一个示例配置和将从查找返回的值。<br/>
      配置的URL为<strong>{'https://example.com/api/users/${key}'}</strong>，并且<code>{'${key}'}</code>
      在查找请求期间被<strong>jane</strong>取代。
    </p>
    <p>
      这是生成的JSON文档:
    </p>
    <pre>{exampleJSON}</pre>

    <Row>
      <Col md={4}>
        <h5 style={{ marginBottom: 10 }}>配置</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          单值JSONPath: <code>$.user.full_name</code><br/>
          多值JSONPath: <em>empty</em><br/>
        </p>
      </Col>
      <Col md={8}>
        <h5 style={{ marginBottom: 10 }}>结果</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          单值: <code>Jane Doe</code><br/>
          多值:
          <pre>{noMultiResult}</pre>
        </p>
      </Col>
    </Row>
    <Row>
      <Col md={4}>
        <h5 style={{ marginBottom: 10 }}>配置</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          单值JSONPath: <code>$.user.full_name</code><br/>
          多值JSONPath: <code>$.user</code><br/>
        </p>
      </Col>
      <Col md={8}>
        <h5 style={{ marginBottom: 10 }}>结果</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          单值: <code>Jane Doe</code><br/>
          多值:
          <pre>{mapResult}</pre>
        </p>
      </Col>
    </Row>
    <Row>
      <Col md={4}>
        <h5 style={{ marginBottom: 10 }}>配置</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          单值JSONPath: <code>$.user.contact.email</code><br/>
          多值JSONPath: <code>$.user.roles[*]</code><br/>
        </p>
      </Col>
      <Col md={8}>
        <h5 style={{ marginBottom: 10 }}>结果</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          单值: <code>jane@example.com</code><br/>
          多值:
          <pre>{listResult}</pre>
        </p>
      </Col>
    </Row>
    <Row>
      <Col md={4}>
        <h5 style={{ marginBottom: 10 }}>配置</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          单值JSONPath: <code>$.user.full_name</code><br/>
          多值JSONPath: <code>$.user.contact</code><br/>
        </p>
      </Col>
      <Col md={8}>
        <h5 style={{ marginBottom: 10 }}>结果</h5>
        <p style={{ marginBottom: 10, padding: 0 }}>
          单值: <code>Jane Doe</code><br/>
          多值:
          <pre>{smallMapResult}</pre>
        </p>
      </Col>
    </Row>

    <h5 style={{ marginBottom: 10 }}>管道规则</h5>
    <p>
      这是一个使用我们上一个配置示例中的示例数据的示例流水线规则。
    </p>
    <pre>{pipelineRule}</pre>
  </div>);
};

export default HTTPJSONPathAdapterDocumentation;
