<?php
// config/conexion.php

$host = 'localhost';
$dbname = 'feedtogether'; // Nombre de tu base de datos
$username = 'root';            // Usuario por defecto en entornos locales (XAMPP/WAMP)
$password = '';                // Contraseña (vacía por defecto en XAMPP)

try {
    $conexion = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Error de conexión a la base de datos: ' . $e->getMessage()
    ]);
    exit;
}
?>