DROP database IF EXISTS cheungssh;
create database cheungssh default charset='utf8';
use cheungssh;
-- MySQL dump 10.13  Distrib 5.1.73, for redhat-linux-gnu (x86_64)
--
-- Host: localhost    Database: cheungssh
-- ------------------------------------------------------
-- Server version	5.1.73

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_id` (`group_id`,`permission_id`),
  KEY `auth_group_permissions_bda51c3c` (`group_id`),
  KEY `auth_group_permissions_1e014c8f` (`permission_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `content_type_id` (`content_type_id`,`codename`),
  KEY `auth_permission_e4470c6e` (`content_type_id`)
) ENGINE=MyISAM AUTO_INCREMENT=84 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (25,'创建服务器',8,'create_server'),(26,'修改服务器',8,'modify_server'),(27,'删除服务器',8,'delete_server'),(28,'执行命令',8,'execute_command'),(29,'远程文件上传',8,'remote_file_upload'),(30,'远程文件下载',8,'remote_file_download'),(31,'秘钥删除',8,'delete_keyfile'),(32,'创建和更新脚本',8,'create_script'),(33,'查看脚本内容',8,'show_script_content'),(34,'查看脚本清单',8,'show_script_list'),(35,'脚本执行',8,'execute_script'),(36,'命令历史',8,'command_history'),(37,'访问记录',8,'access_history'),(38,'登录记录',8,'login_success_history'),(39,'命令黑名单添加',8,'command_black_create'),(40,'命令黑名单查看',8,'command_black_list'),(41,'命令黑名单删除',8,'command_black_delete'),(42,'登录失败清单',8,'login_fail_list'),(43,'登录阈值设置',8,'login_limit_set'),(44,'IP解锁',8,'unlock_ip'),(45,'远程文件管理创建',8,'remote_file_admin_create'),(46,'远程文件管理列表',8,'remote_file_admin_list'),(47,'远程文件内容查看',8,'remote_file_admin_content_show'),(48,'远程文件内容更新',8,'remote_file_admin_content_update'),(49,'自定义资产项查看',8,'custom_assets_list'),(50,'自定义资产创建/修改',8,'custom_assets_create'),(51,'自定义资产删除',8,'custom_assets_delete'),(52,'查看资产信息',8,'assets_list'),(53,'查看App应用列表',8,'view_app'),(54,'创建和修改App应用',8,'create_app'),(55,'删除App应用',8,'delete_app'),(56,'执行App应用',8,'execute_app'),(57,'部署清单查看',8,'deployment_list'),(58,'创建/修改部署任务',8,'deployment_create'),(59,'删除部署任务',8,'deployment_delete'),(60,'部署进度查看',8,'deployment_progress'),(61,'执行部署任务',8,'deployment_execute'),(62,'Docker镜像清单查看',8,'docker_image_list'),(63,'Docker镜像下载',8,'docker_image_create'),(64,'Docker镜像删除',8,'docker_image_delete'),(65,'Docker容器清单查看',8,'docker_containner_list'),(66,'Docker创建容器',8,'docker_create_containner'),(67,'Docker删除容器',8,'docker_containner_delete'),(68,'Docker启动容器',8,'docker_containner_start'),(69,'Dokcer关闭容器',8,'docker_containner_stop'),(70,'Docker容器保存为镜像',8,'docker_containner_save'),(71,'创建网络设备节点',8,'create_device'),(72,'查看网络拓扑图',8,'get_device'),(73,'保存拓扑布局',8,'save_topology'),(74,'单独登录SSH',8,'active_ssh'),(75,'查看Linux计划任务列表',8,'get_crontab_list'),(76,'删除Linux计划任务列表',8,'delete_crontab_list'),(77,'创建/修改Linux计划任务列表',8,'create_or_modify_crontab');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user`
--

DROP TABLE IF EXISTS `auth_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `first_name` varchar(30) NOT NULL,
  `last_name` varchar(30) NOT NULL,
  `email` varchar(75) NOT NULL,
  `password` varchar(128) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `last_login` datetime NOT NULL,
  `date_joined` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user`
--

LOCK TABLES `auth_user` WRITE;
/*!40000 ALTER TABLE `auth_user` DISABLE KEYS */;
INSERT INTO `auth_user` VALUES (1,'cheungssh','','','a@q.com','pbkdf2_sha256$10000$Fk57SqVxAfLo$jBaNwQXPqC5VD+knd5gWi0Bn3bGcMIjtpUp9VxWuzn0=',1,1,1,'2017-08-28 10:35:05','2017-06-09 13:48:08'),(2,'test','','','','pbkdf2_sha256$10000$lQGGiken7dDB$TbBL52R6oQvRQvc8FJcuSfYx8ERI1BXhJDiEooi5+zk=',0,1,0,'2017-08-27 10:51:57','2017-08-26 04:05:26');
/*!40000 ALTER TABLE `auth_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_groups`
--

DROP TABLE IF EXISTS `auth_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`group_id`),
  KEY `auth_user_groups_fbfc09f1` (`user_id`),
  KEY `auth_user_groups_bda51c3c` (`group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_groups`
--

LOCK TABLES `auth_user_groups` WRITE;
/*!40000 ALTER TABLE `auth_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_user_user_permissions`
--

DROP TABLE IF EXISTS `auth_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_user_user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`permission_id`),
  KEY `auth_user_user_permissions_fbfc09f1` (`user_id`),
  KEY `auth_user_user_permissions_1e014c8f` (`permission_id`)
) ENGINE=MyISAM AUTO_INCREMENT=54 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
INSERT INTO `auth_user_user_permissions` VALUES (1,2,25),(2,2,26),(3,2,27),(4,2,28),(5,2,29),(6,2,30),(7,2,31),(8,2,32),(9,2,33),(10,2,34),(11,2,35),(12,2,36),(13,2,37),(14,2,38),(15,2,39),(16,2,40),(17,2,41),(18,2,42),(19,2,43),(20,2,44),(21,2,45),(22,2,46),(23,2,47),(24,2,48),(25,2,49),(26,2,50),(27,2,51),(28,2,52),(29,2,53),(30,2,54),(31,2,55),(32,2,56),(33,2,57),(34,2,58),(35,2,59),(36,2,60),(37,2,61),(38,2,62),(39,2,63),(40,2,64),(41,2,65),(42,2,66),(43,2,67),(44,2,68),(45,2,69),(46,2,70),(47,2,71),(48,2,72),(49,2,73),(50,2,74),(51,2,75),(52,2,76),(53,2,77);
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_main_conf`
--

DROP TABLE IF EXISTS `cheungssh_main_conf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_main_conf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `RunMode` varchar(1) NOT NULL,
  `TimeOut` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_main_conf`
--

LOCK TABLES `cheungssh_main_conf` WRITE;
/*!40000 ALTER TABLE `cheungssh_main_conf` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_main_conf` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_serverconf`
--

DROP TABLE IF EXISTS `cheungssh_serverconf`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_serverconf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `IP` varchar(200) NOT NULL,
  `HostName` varchar(100) NOT NULL,
  `Port` int(11) NOT NULL,
  `Group` varchar(200) NOT NULL,
  `Username` varchar(200) NOT NULL,
  `Password` varchar(128) NOT NULL,
  `KeyFile` varchar(100) NOT NULL,
  `Sudo` varchar(1) NOT NULL,
  `SudoPassword` varchar(2000) DEFAULT NULL,
  `Su` varchar(1) DEFAULT NULL,
  `SuPassword` varchar(2000) DEFAULT NULL,
  `LoginMethod` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_serverconf`
--

LOCK TABLES `cheungssh_serverconf` WRITE;
/*!40000 ALTER TABLE `cheungssh_serverconf` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_serverconf` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_serverinfo`
--

DROP TABLE IF EXISTS `cheungssh_serverinfo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_serverinfo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `IP_id` int(11) NOT NULL,
  `Position` longtext,
  `Description` longtext,
  `CPU` varchar(20) DEFAULT NULL,
  `CPU_process_must` varchar(10) DEFAULT NULL,
  `MEM_process_must` varchar(10) DEFAULT NULL,
  `Use_CPU` varchar(20) DEFAULT NULL,
  `uSE_MEM` varchar(20) DEFAULT NULL,
  `MEM` varchar(20) DEFAULT NULL,
  `IO` varchar(200) DEFAULT NULL,
  `Platform` varchar(200) NOT NULL,
  `System` varchar(200) NOT NULL,
  `InBankWidth` int(11) DEFAULT NULL,
  `OutBankWidth` int(11) DEFAULT NULL,
  `CurrentUser` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IP_id` (`IP_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_serverinfo`
--

LOCK TABLES `cheungssh_serverinfo` WRITE;
/*!40000 ALTER TABLE `cheungssh_serverinfo` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_serverinfo` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `corsheaders_corsmodel`
--

DROP TABLE IF EXISTS `corsheaders_corsmodel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `corsheaders_corsmodel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cors` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `corsheaders_corsmodel`
--

LOCK TABLES `corsheaders_corsmodel` WRITE;
/*!40000 ALTER TABLE `corsheaders_corsmodel` DISABLE KEYS */;
/*!40000 ALTER TABLE `corsheaders_corsmodel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `object_id` longtext,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL,
  `change_message` longtext NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_fbfc09f1` (`user_id`),
  KEY `django_admin_log_e4470c6e` (`content_type_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2017-08-26 04:05:26',1,3,'2','test',1,''),(2,'2017-08-26 04:06:11',1,3,'2','test',2,'已修改 password 和 user_permissions 。');
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `app_label` (`app_label`,`model`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'permission','auth','permission'),(2,'group','auth','group'),(3,'user','auth','user'),(4,'content type','contenttypes','contenttype'),(5,'session','sessions','session'),(6,'cors model','corsheaders','corsmodel'),(7,'main_ conf','cheungssh','main_conf'),(8,'server conf','cheungssh','serverconf'),(9,'server info','cheungssh','serverinfo'),(10,'log entry','admin','logentry');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_c25c2c28` (`expire_date`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('cfc2b250a063fb24d41d4d107e132c73','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-08-22 14:37:09'),('a800611dd8f88a89a4acfbbf25deb266','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-08-27 05:33:57'),('5c2935c6652c147593f3d78862b1604f','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-01 04:32:18'),('0b3f1cb925501edb6c4c4d0d52588fb9','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-01 12:48:39'),('62f0c668a0caf0c8c96bf80f97d30f54','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-01 14:24:20'),('67b680e5b8861a8b74d1a7a45f2be7ba','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-02 01:21:28'),('d986d833bb94903032ff51dcbc720551','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-02 02:56:22'),('13d0c1505ced994d62e6f3ddf2258b95','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-02 03:13:50'),('0f795fa0a61d552f84984719cb1e3041','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-06 11:49:53'),('cbe0ee6940a49a76c1d8fd32d4f0d775','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-07 11:01:17'),('786a1722e2ec4f169d1925cb355ae669','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-07 15:39:31'),('c6c964f5559375da60f2fdb3c276326b','YjJjZmM3YmM1YWUyOTNkN2MzMmU2MzZhNDdmZGJiOTY5Mzg0ZDU0MzqAAn1xAShVCHVzZXJuYW1l\ncQJYBAAAAHRlc3RxA1UPX3Nlc3Npb25fZXhwaXJ5cQRLAFUSX2F1dGhfdXNlcl9iYWNrZW5kcQVV\nKWRqYW5nby5jb250cmliLmF1dGguYmFja2VuZHMuTW9kZWxCYWNrZW5kcQZVDV9hdXRoX3VzZXJf\naWRxB4oBAnUu\n','2017-09-09 11:45:46'),('ce9d6935f8aa847afa78a6d3221fe424','YjJjZmM3YmM1YWUyOTNkN2MzMmU2MzZhNDdmZGJiOTY5Mzg0ZDU0MzqAAn1xAShVCHVzZXJuYW1l\ncQJYBAAAAHRlc3RxA1UPX3Nlc3Npb25fZXhwaXJ5cQRLAFUSX2F1dGhfdXNlcl9iYWNrZW5kcQVV\nKWRqYW5nby5jb250cmliLmF1dGguYmFja2VuZHMuTW9kZWxCYWNrZW5kcQZVDV9hdXRoX3VzZXJf\naWRxB4oBAnUu\n','2017-09-09 04:06:27'),('8e8c05065e7b93fa83941137a850cf35','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-09 12:09:58'),('3643ceb80e5fc3f4658814f2478e0481','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-11 10:35:05'),('b50feb3892750bb336670efb7a282702','ZTJjNTY1Yzk2ZWFhY2Q0ODBiZDJmNGRlNTE3YTY5ZDhjMzNkYTVlMjqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigEBdS4=\n','2017-09-10 10:52:12');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-08-28 19:50:41
