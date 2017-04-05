-- MySQL dump 10.13  Distrib 5.1.73, for redhat-linux-gnu (x86_64)
--
-- Host: localhost    Database: cheungssh
-- ------------------------------------------------------
-- Server version	5.1.73-log

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
) ENGINE=MyISAM AUTO_INCREMENT=65 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (25,'可执行命令',8,'excute_cmd'),(26,'查看命令历史',8,'show_cmd_history'),(27,'查看操作记录',8,'show_access_page'),(28,'允许从PC上传文件和密钥',8,'local_file_upload'),(29,'允许PC下载文件',8,'local_file_download'),(30,'远程文件上传',8,'transfile_upload'),(31,'远程文件下载',8,'transfile_download'),(32,'查看文件传输记录',8,'transfile_history_show'),(33,'查看计划任务',8,'crond_show'),(34,'删除计划任务',8,'crond_del'),(35,'创建计划任务',8,'crond_create'),(36,'秘钥上传',8,'transfile_keyfile'),(37,'删除秘钥',8,'key_del'),(38,'查看秘钥',8,'key_list'),(39,'创建服务器',8,'config_add'),(40,'删除服务器',8,'config_del'),(41,'修改服务器',8,'config_modify'),(42,'查看脚本内容',8,'scriptfile_show'),(43,'创建脚本',8,'scriptfile_add'),(44,'删除脚本',8,'scriptfile_del'),(45,'显示脚本清单',8,'scriptfile_list'),(46,'批量从web创建服务器',8,'batchconfig_web'),(47,'添加命令黑名单',8,'addblackcmd'),(48,'删除命令黑名单 ',8,'delblackcmd'),(49,'查看命令黑名单',8,'listblackcmd'),(50,'查看登录记录',8,'show_sign_record'),(51,'查看锁定的IP记录',8,'show_ip_limit'),(52,'删除锁定的IP记录',8,'del_ip_limit'),(53,'查看登陆失败次数阈值',8,'show_threshold'),(54,'设置登录失败次数阈值',8,'set_threshold'),(55,'查看远程服务器文件内容',8,'get_remote_filecontent'),(56,'更新远程服务器文件内容',8,'up_remote_filecontent'),(57,'查看所有文件清单',8,'catadminfilelist'),(58,'可设置文件清单',8,'setadminfilelist');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-12-12 22:58:18
