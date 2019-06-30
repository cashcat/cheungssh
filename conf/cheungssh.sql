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
) ENGINE=MyISAM AUTO_INCREMENT=135 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (25,'Can add servers list',9,'add_serverslist'),(26,'Can change servers list',9,'change_serverslist'),(27,'Can delete servers list',9,'delete_serverslist'),(28,'创建服务器',9,'create_server'),(29,'修改服务器',9,'modify_server'),(30,'删除服务器',9,'delete_server'),(31,'执行命令',9,'execute_command'),(32,'远程文件上传',9,'remote_file_upload'),(33,'远程文件下载',9,'remote_file_download'),(34,'秘钥删除',9,'delete_keyfile'),(35,'创建和更新脚本',9,'create_script'),(36,'查看脚本内容',9,'show_script_content'),(37,'查看脚本清单',9,'show_script_list'),(38,'脚本执行',9,'execute_script'),(39,'命令历史',9,'command_history'),(40,'访问记录',9,'access_history'),(41,'登录记录',9,'login_success_history'),(42,'命令黑名单添加',9,'command_black_create'),(43,'命令黑名单查看',9,'command_black_list'),(44,'命令黑名单删除',9,'command_black_delete'),(45,'登录失败清单',9,'login_fail_list'),(46,'登录阈值设置',9,'login_limit_set'),(47,'IP解锁',9,'unlock_ip'),(48,'远程文件管理创建',9,'remote_file_admin_create'),(49,'远程文件管理列表',9,'remote_file_admin_list'),(50,'远程文件内容查看',9,'remote_file_admin_content_show'),(51,'远程文件内容更新',9,'remote_file_admin_content_update'),(52,'自定义资产项查看',9,'custom_assets_list'),(53,'自定义资产创建/修改',9,'custom_assets_create'),(54,'自定义资产删除',9,'custom_assets_delete'),(55,'查看资产信息',9,'assets_list'),(56,'查看App应用列表',9,'view_app'),(57,'创建和修改App应用',9,'create_app'),(58,'删除App应用',9,'delete_app'),(59,'执行App应用',9,'execute_app'),(60,'部署清单查看',9,'deployment_list'),(61,'创建/修改部署任务',9,'deployment_create'),(62,'删除部署任务',9,'deployment_delete'),(63,'部署进度查看',9,'deployment_progress'),(64,'执行部署任务',9,'deployment_execute'),(65,'Docker镜像清单查看',9,'docker_image_list'),(66,'Docker镜像下载',9,'docker_image_create'),(67,'Docker镜像删除',9,'docker_image_delete'),(68,'Docker容器清单查看',9,'docker_containner_list'),(69,'Docker创建容器',9,'docker_create_containner'),(70,'Docker删除容器',9,'docker_containner_delete'),(71,'Docker启动容器',9,'docker_containner_start'),(72,'Dokcer关闭容器',9,'docker_containner_stop'),(73,'Docker容器保存为镜像',9,'docker_containner_save'),(74,'创建网络设备节点',9,'create_device'),(75,'查看网络拓扑图',9,'get_device'),(76,'保存拓扑布局',9,'save_topology'),(77,'单独登录SSH',9,'active_ssh'),(84,'Can add permission',1,'add_permission'),(85,'Can change permission',1,'change_permission'),(86,'Can delete permission',1,'delete_permission'),(87,'Can add group',2,'add_group'),(88,'Can change group',2,'change_group'),(89,'Can delete group',2,'delete_group'),(90,'Can add user',3,'add_user'),(91,'Can change user',3,'change_user'),(92,'Can delete user',3,'delete_user'),(93,'Can add content type',4,'add_contenttype'),(94,'Can change content type',4,'change_contenttype'),(95,'Can delete content type',4,'delete_contenttype'),(96,'Can add session',5,'add_session'),(97,'Can change session',5,'change_session'),(98,'Can delete session',5,'delete_session'),(99,'Can add cors model',6,'add_corsmodel'),(100,'Can change cors model',6,'change_corsmodel'),(101,'Can delete cors model',6,'delete_corsmodel'),(102,'Can add service operation list',11,'add_serviceoperationlist'),(103,'Can change service operation list',11,'change_serviceoperationlist'),(104,'Can delete service operation list',11,'delete_serviceoperationlist'),(105,'Can add user with black list group',12,'add_userwithblacklistgroup'),(106,'Can change user with black list group',12,'change_userwithblacklistgroup'),(107,'Can delete user with black list group',12,'delete_userwithblacklistgroup'),(108,'Can add black list list',13,'add_blacklistlist'),(109,'Can change black list list',13,'change_blacklistlist'),(110,'Can delete black list list',13,'delete_blacklistlist'),(111,'Can add black list group',14,'add_blacklistgroup'),(112,'Can change black list group',14,'change_blacklistgroup'),(113,'Can delete black list group',14,'delete_blacklistgroup'),(114,'Can add batch shell list',15,'add_batchshelllist'),(115,'Can change batch shell list',15,'change_batchshelllist'),(116,'Can delete batch shell list',15,'delete_batchshelllist'),(117,'Can add remote file history version',16,'add_remotefilehistoryversion'),(118,'Can change remote file history version',16,'change_remotefilehistoryversion'),(119,'Can delete remote file history version',16,'delete_remotefilehistoryversion'),(120,'Can add remote file',17,'add_remotefile'),(121,'Can change remote file',17,'change_remotefile'),(122,'Can delete remote file',17,'delete_remotefile'),(123,'Can add scripts historic version',7,'add_scriptshistoricversion'),(124,'Can change scripts historic version',7,'change_scriptshistoricversion'),(125,'Can delete scripts historic version',7,'delete_scriptshistoricversion'),(126,'Can add scripts list',8,'add_scriptslist'),(127,'Can change scripts list',8,'change_scriptslist'),(128,'Can delete scripts list',8,'delete_scriptslist'),(129,'查看Linux计划任务列表',9,'get_crontab_list'),(130,'删除Linux计划任务列表',9,'delete_crontab_list'),(131,'创建/修改Linux计划任务列表',9,'create_or_modify_crontab'),(132,'Can add log entry',10,'add_logentry'),(133,'Can change log entry',10,'change_logentry'),(134,'Can delete log entry',10,'delete_logentry');
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
INSERT INTO `auth_user` VALUES (1,'admin','','','admin@q.com','pbkdf2_sha256$10000$1TqR1fl3RgEJ$5avrZfCzq7CslEfoDXpp6PMHL6iqJwu5637qy3YMthc=',1,1,1,'2019-05-11 14:10:22','2019-05-11 14:10:22'),(2,'cheungssh','','','a@q.com','pbkdf2_sha256$10000$O6UZW8bi7aDN$yqiJ33LM8pdkV/LrCaJehPMCVQfeZc73jCDiVaVJz94=',1,1,1,'2019-06-30 13:58:43','2019-06-30 13:44:33');
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_user_user_permissions`
--

LOCK TABLES `auth_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `auth_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_batchshelllist`
--

DROP TABLE IF EXISTS `cheungssh_batchshelllist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_batchshelllist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `group` varchar(200) NOT NULL,
  `create_time` varchar(200) NOT NULL,
  `username` varchar(160) NOT NULL,
  `command` longtext NOT NULL,
  `description` varchar(1600) NOT NULL,
  `parameters` varchar(1600) NOT NULL,
  `os_type` varchar(2000) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_batchshelllist`
--

LOCK TABLES `cheungssh_batchshelllist` WRITE;
/*!40000 ALTER TABLE `cheungssh_batchshelllist` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_batchshelllist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_blacklistgroup`
--

DROP TABLE IF EXISTS `cheungssh_blacklistgroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_blacklistgroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `list` varchar(2000) NOT NULL,
  `owner` varchar(200) NOT NULL,
  `create_time` varchar(200) NOT NULL,
  `description` varchar(1600) DEFAULT NULL,
  `default` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_blacklistgroup`
--

LOCK TABLES `cheungssh_blacklistgroup` WRITE;
/*!40000 ALTER TABLE `cheungssh_blacklistgroup` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_blacklistgroup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_blacklistlist`
--

DROP TABLE IF EXISTS `cheungssh_blacklistlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_blacklistlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `owner` varchar(200) NOT NULL,
  `create_time` varchar(200) NOT NULL,
  `expression` longtext NOT NULL,
  `description` varchar(1600) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_blacklistlist`
--

LOCK TABLES `cheungssh_blacklistlist` WRITE;
/*!40000 ALTER TABLE `cheungssh_blacklistlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_blacklistlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_remotefile`
--

DROP TABLE IF EXISTS `cheungssh_remotefile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_remotefile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(2000) NOT NULL,
  `sid` int(11) NOT NULL,
  `tid` int(11) NOT NULL,
  `alias` varchar(200) NOT NULL,
  `description` varchar(160) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_remotefile`
--

LOCK TABLES `cheungssh_remotefile` WRITE;
/*!40000 ALTER TABLE `cheungssh_remotefile` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_remotefile` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_remotefilehistoryversion`
--

DROP TABLE IF EXISTS `cheungssh_remotefilehistoryversion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_remotefilehistoryversion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `create_time` varchar(200) NOT NULL,
  `ip` varchar(16) NOT NULL,
  `username` varchar(160) NOT NULL,
  `path` varchar(160) NOT NULL,
  `remote_file_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_remotefilehistoryversion`
--

LOCK TABLES `cheungssh_remotefilehistoryversion` WRITE;
/*!40000 ALTER TABLE `cheungssh_remotefilehistoryversion` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_remotefilehistoryversion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_scriptshistoricversion`
--

DROP TABLE IF EXISTS `cheungssh_scriptshistoricversion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_scriptshistoricversion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sid` int(11) NOT NULL,
  `path` varchar(2000) NOT NULL,
  `create_time` varchar(200) NOT NULL,
  `owner` varchar(20) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `parameters` longtext NOT NULL,
  `version` varchar(50) NOT NULL,
  `comment` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_scriptshistoricversion`
--

LOCK TABLES `cheungssh_scriptshistoricversion` WRITE;
/*!40000 ALTER TABLE `cheungssh_scriptshistoricversion` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_scriptshistoricversion` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_scriptslist`
--

DROP TABLE IF EXISTS `cheungssh_scriptslist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_scriptslist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `script_name` varchar(200) NOT NULL,
  `script_group` varchar(20) NOT NULL,
  `description` longtext NOT NULL,
  `os_type` varchar(2000) NOT NULL,
  `active_version` int(11) NOT NULL,
  `executable` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_scriptslist`
--

LOCK TABLES `cheungssh_scriptslist` WRITE;
/*!40000 ALTER TABLE `cheungssh_scriptslist` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_scriptslist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_serverslist`
--

DROP TABLE IF EXISTS `cheungssh_serverslist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_serverslist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(200) NOT NULL,
  `owner` varchar(100) DEFAULT NULL,
  `hostname` varchar(100) DEFAULT NULL,
  `port` int(11) NOT NULL,
  `group` varchar(200) NOT NULL,
  `username` varchar(20) NOT NULL,
  `alias` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL,
  `password` varchar(128) NOT NULL,
  `os_type` varchar(128) NOT NULL,
  `sudo` varchar(1) NOT NULL,
  `sudo_password` varchar(2000) DEFAULT NULL,
  `su` varchar(1) NOT NULL,
  `su_password` varchar(2000) DEFAULT NULL,
  `description` longtext,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_serverslist`
--

LOCK TABLES `cheungssh_serverslist` WRITE;
/*!40000 ALTER TABLE `cheungssh_serverslist` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_serverslist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_serviceoperationlist`
--

DROP TABLE IF EXISTS `cheungssh_serviceoperationlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_serviceoperationlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(5800) DEFAULT NULL,
  `create_time` varchar(200) NOT NULL,
  `description` varchar(200) NOT NULL,
  `list` longtext NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_serviceoperationlist`
--

LOCK TABLES `cheungssh_serviceoperationlist` WRITE;
/*!40000 ALTER TABLE `cheungssh_serviceoperationlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_serviceoperationlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cheungssh_userwithblacklistgroup`
--

DROP TABLE IF EXISTS `cheungssh_userwithblacklistgroup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `cheungssh_userwithblacklistgroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uid` int(11) DEFAULT NULL,
  `black_list_group_id` varchar(5800) DEFAULT NULL,
  `create_time` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cheungssh_userwithblacklistgroup`
--

LOCK TABLES `cheungssh_userwithblacklistgroup` WRITE;
/*!40000 ALTER TABLE `cheungssh_userwithblacklistgroup` DISABLE KEYS */;
/*!40000 ALTER TABLE `cheungssh_userwithblacklistgroup` ENABLE KEYS */;
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
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
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
) ENGINE=MyISAM AUTO_INCREMENT=18 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'permission','auth','permission'),(2,'group','auth','group'),(3,'user','auth','user'),(4,'content type','contenttypes','contenttype'),(5,'session','sessions','session'),(6,'cors model','corsheaders','corsmodel'),(7,'scripts historic version','cheungssh','scriptshistoricversion'),(8,'scripts list','cheungssh','scriptslist'),(9,'servers list','cheungssh','serverslist'),(10,'log entry','admin','logentry'),(11,'service operation list','cheungssh','serviceoperationlist'),(12,'user with black list group','cheungssh','userwithblacklistgroup'),(13,'black list list','cheungssh','blacklistlist'),(14,'black list group','cheungssh','blacklistgroup'),(15,'batch shell list','cheungssh','batchshelllist'),(16,'remote file history version','cheungssh','remotefilehistoryversion'),(17,'remote file','cheungssh','remotefile');
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
INSERT INTO `django_session` VALUES ('02918c2222f84640f5798620418e3d64','ZmIwZDMwM2YzYzE5NTg4ZDJkOWQ2MjE3YzAzZjc1MzU0NTNlN2VkZTqAAn1xAShVCHVzZXJuYW1l\ncQJYCQAAAGNoZXVuZ3NzaHEDVQ9fc2Vzc2lvbl9leHBpcnlxBEsAVRJfYXV0aF91c2VyX2JhY2tl\nbmRxBVUpZGphbmdvLmNvbnRyaWIuYXV0aC5iYWNrZW5kcy5Nb2RlbEJhY2tlbmRxBlUNX2F1dGhf\ndXNlcl9pZHEHigECdS4=\n','2019-07-14 13:58:43');
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

-- Dump completed on 2019-06-30 22:38:07
