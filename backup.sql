-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: hackathon_finance_ai
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `analysis_history`
--

DROP TABLE IF EXISTS `analysis_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analysis_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `ingreso_mensual` double NOT NULL,
  `nivel_endeudamiento` int NOT NULL,
  `frecuencia_ahorro` varchar(255) NOT NULL,
  `perfil_financiero` varchar(255) NOT NULL,
  `puntaje` int NOT NULL,
  `recomendaciones` text,
  `fecha_analisis` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_analysis_user` (`user_id`),
  CONSTRAINT `fk_analysis_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analysis_history`
--

LOCK TABLES `analysis_history` WRITE;
/*!40000 ALTER TABLE `analysis_history` DISABLE KEYS */;
INSERT INTO `analysis_history` VALUES (1,3,4500,25,'Muy alta','Excelente',110,'[]','2026-08-09 05:06:42'),(2,3,4500,40,'Muy alta','Excelente',80,'[\"[ALERTA] El gasto en \'Supermercado\' supera el límite preventivo recomendado por transacción\",\"[ALERTA] El gasto en \'Combustible\' supera el límite preventivo recomendado por transacción\",\"[ALERTA] El gasto en \'Streaming\' supera el límite preventivo recomendado por transacción\"]','2026-08-09 05:18:55');
/*!40000 ALTER TABLE `analysis_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction_history`
--

DROP TABLE IF EXISTS `transaction_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `analysis_id` bigint NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `valor` double NOT NULL,
  `categoria` varchar(255) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_transaction_analysis` (`analysis_id`),
  CONSTRAINT `fk_transaction_analysis` FOREIGN KEY (`analysis_id`) REFERENCES `analysis_history` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction_history`
--

LOCK TABLES `transaction_history` WRITE;
/*!40000 ALTER TABLE `transaction_history` DISABLE KEYS */;
INSERT INTO `transaction_history` VALUES (1,1,'Supermercado',420,'Alimentación'),(2,1,'Combustible',300,'Otros'),(3,1,'Streaming',400,'Entretenimiento'),(4,2,'Supermercado',500,'Alimentación'),(5,2,'Combustible',600,'Otros'),(6,2,'Streaming',700,'Entretenimiento');
/*!40000 ALTER TABLE `transaction_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('ADMIN','USER') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$X8mR0lT.2E8q5V.8v9gAjeP5C7.30s6D3G3Z4R6W3C1lqK1/U1E3.','ADMIN'),(2,'MarcoArias','$2a$10$wTR2tD8dnsDCnG/aZyNoNuLtBUmSyHm.xtmeK2Spp8sADo6j2DzVW','ADMIN'),(3,'USUARIO1','$2a$10$g5PnFyXOIalvamGB1ALope6cjGgCipPYHc3.E33cmwLghKb4XsNu.','USER');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-09 23:34:19
