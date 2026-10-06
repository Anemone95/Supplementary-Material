import React from 'react';
import { Link } from 'react-router';

import Routes from 'routing/Routes';
import DocsHelper from 'util/DocsHelper';
import DocumentationLink from 'components/support/DocumentationLink';

class NotificationsFactory {
  static getForNotification(notification) {
    switch (notification.type) {
      case 'check_server_clocks':
        return {
          title: '检查您的Graylog服务器节点的系统时钟。',
          description: (
            <span>
              一个Graylog服务器节点检测到一个被激活后立即被认为是非激活状态的情况。
              这通常表示系统时间的重大跳转，例如通过NTP，或者第二个Graylog服务器节点在系统时间不同的系统上被激活。
              请确保Graylog2的系统时钟是同步的。
            </span>
          ),
        };
      case 'deflector_exists_as_index':
        return {
          title: '偏转器作为一个索引存在，而不是一个别名。',
          description: (
            <span>
              偏转器本是一个别名，但作为一个索引存在。基础设施的多次故障可能导致这一点，您的消息仍然被索引，但是搜索和所有维护任务将会失败或产生不正确的结果。强烈建议你尽快采取行动。
            </span>
          ),
        };
      case 'email_transport_configuration_invalid':
        return {
          title: '电子邮件传输配置丢失或无效！',
          description: (
            <span>
              电子邮件传输子系统的配置已经显示丢失或无效，请检查您的Graylog服务器配置文件的相关部分。这是详细的错误信息: {notification.details.exception}
            </span>
          ),
        };
      case 'email_transport_failed':
        return {
          title: '在发送电子邮件时发生了错误！',
          description: (
            <span>
              在尝试发送电子邮件时，Graylog服务器出现错误。这是详细的错误信息: {notification.details.exception}
            </span>
          ),
        };
      case 'es_cluster_red':
        return {
          title: 'Elasticsearch集群出问题(红色)',
          description: (
            <span>
              Elasticsearch集群状态为红色，这意味着没有指定分片。这通常意味着一个崩溃和腐败的集群，需要进行调查。Graylog将会写入到本地的磁盘日志。了解如何解决这个问题，请查看
              {' '}
              <DocumentationLink page={DocsHelper.PAGES.ES_CLUSTER_STATUS_RED} text="Elasticsearch设置文档" />
            </span>
          ),
        };
      case 'es_open_files':
        return {
          title: 'Elasticsearch节点的打开文件限制太低',
          description: (
            <span>
              在集群中有Elasticsearch节点的打开文件限制太低（当前限制:{' '}
              <em>{notification.details.max_file_descriptors}</em> 在 <em>{notification.details.hostname}</em>;
              应至少64000）这将导致难以诊断的问题。了解如何提高打开文件的最大数量，请查看{' '}
              <DocumentationLink page={DocsHelper.PAGES.ES_OPEN_FILE_LIMITS} text="Elasticsearch设置文档" />。
            </span>
          ),
        };
      case 'es_unavailable':
        return {
          title: 'Elasticsearch集群不可用',
          description: (
            <span>
              Graylog无法成功连接到Elasticsearch集群。如果您使用组播，请检查它是否在您的网络中工作，并且可以访问Elasticsearch。 同时检查集群名称设置是否正确。了解如何解决这个问题，请查看
              {' '}
              <DocumentationLink page={DocsHelper.PAGES.ES_CLUSTER_UNAVAILABLE}
                                 text="Elasticsearch设置文档" />
            </span>
          ),
        };
      case 'gc_too_long':
        return {
          title: 'GC停顿时间过长的节点',
          description: (
            <span>
              有垃圾收集运行时间过长的Graylog节点，而垃圾收集运行应该尽可能短。请检查这些节点是否健康。(节点:
              <em>{notification.node_id}</em>, GC 持续时间: <em>{notification.details.gc_duration_ms} ms</em>,
              GC 阈值: <em>{notification.details.gc_threshold_ms} ms</em>)
            </span>
          ),
        };
      case 'generic':
        return {
          title: notification.details.title,
          description: notification.details.description,
        };
      case 'index_ranges_recalculation':
        return {
          title: '索引段需要重新计算',
          description: (
            <span>
              索引段不同步。请到系统/索引菜单，从
              {notification.details.index_sets ? (`的维护菜单触发索引段重新计算以下索引集: ${notification.details.index_sets}`) : '所有索引集'}
            </span>
          ),
        };
      case 'input_failed_to_start':
        return {
          title: '输入无法启动',
          description: (
            <span>
              输入{notification.details.input_id}无法在节点{notification.node_id}上启动，有这些原因:
              »{notification.details.reason}«. T这意味着您无法从此输入接收任何消息，这大多是由错误配置或错误导致的。你可以点击
              {' '}
              <Link to={Routes.SYSTEM.INPUTS}>这里</Link>来解决这个问题。
            </span>
          ),
        };
      case 'journal_uncommitted_messages_deleted':
        return {
          title: '从日志中删除的未提交的消息',
          description: (
            <span>
              一些消息在被写入Elasticsearch之前已从Graylog日志中删除。请确认您的Elasticsearch集群是否健康并且足够快 您可能还需要查看您的Graylog日志设置并设置更高的限制。(节点:
              <em>{notification.node_id}</em>)
            </span>
          ),
        };
      case 'journal_utilization_too_high':
        return {
          title: '日志利用率太高',
          description: (
            <span>
              日志利用率太高，可能会很快超过限制。请确认您的Elasticsearch集群是否健康并且足够快。您可能还需要查看您的Graylog日志设置并设置更高的限制。(节点:
              <em>{notification.node_id}</em>)
            </span>
          ),
        };
      case 'multi_master':
        return {
          title: '集群中的多个Graylog服务器的主服务器',
          description: (
            <span>
              在您的Graylog集群中有多个Graylog服务器实例被配置为主服务器。如果已经存在主服务器，集群会自动处理这个问题，让新的节点启动为从服务器，但是您仍然应该解决这个问题。检查每个节点的graylog.conf，并确保只有一个实例将‘是主服务器’设置为true。如果您认为解决了问题，请关闭此通知消息，如果再次启动第二个主节点，它将又弹出。
            </span>
          ),
        };
      case 'no_input_running':
        return {
          title: '有一个没有任何运行情况输入的节点。',
          description: (
            <span>
              有一个没有任何运行情况输入的节点，这意味着在此时您没有收到来自此节点的任何消息。这很可能预示着错误或错误配置。您可以点击
              <Link to={Routes.SYSTEM.INPUTS}>这里</Link>来解决这个问题。
            </span>
          ),
        };
      case 'no_master':
        return {
          title: '集群中没有检测到主Graylog服务器节点。',
          description: (
            <span>
              Graylog服务器的某些操作需要主节点的存在，但是没有这样的主节点启动了。请确保您的某个Graylog服务器节点包含该设置
              <code>is_master = true</code>
              在其配置中，它正在运行。在这个问题解决之前，索引循环将无法运行，这意味着索引保留机制也不运行，导致索引大小增加。某些维护功能以及各种Web界面页面(例如：仪表板)不可用。
            </span>
          ),
        };
      case 'outdated_version':
        return {
          title: '您正在运行过时的Graylog版本。',
          description: (
            <span>
              最近的稳定的Graylog版本是<em>{notification.details.current_version}</em>。
             可以从<a href="https://www.graylog.org/" target="_blank">https://www.graylog.org/</a>中下载。
            </span>
          ),
        };
      case 'output_disabled':
        return {
          title: '输出禁用',
          description: (
            <span>
              一个id为{notification.details.outputId}的输出在流"{notification.details.streamTitle}"
              (id: {notification.details.streamId})中，已经被禁用了{notification.details.faultPenaltySeconds}
              秒。因为{notification.details.faultCount}失败。
              (节点: <em>{notification.node_id}</em>, 故障阈值: <em>{notification.details.faultCountThreshold}</em>)
            </span>
          ),
        };
      case 'stream_processing_disabled':
        return {
          title: '由于处理时间过长，流的处理已被禁用。',
          description: (
            <span>
              流<em>{notification.details.stream_id}</em>的处理已经处理了{' '}
              {notification.details.fault_count}过久时间。为保护消息处理的稳定性，该流已被禁用。请更正流规则并重新启用流。查看
              <DocumentationLink page={DocsHelper.PAGES.STREAM_PROCESSING_RUNTIME_LIMITS} text="文档" />{' '}
              以获得更多信息。
            </span>
          ),
        };
      default:
        return { title: `未知 (${notification.type})`, description: '未知' };
    }
  }
}

export default NotificationsFactory;
