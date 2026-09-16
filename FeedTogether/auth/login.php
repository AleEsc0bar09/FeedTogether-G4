<?php
// auth/Login.php

session_start();
header('Content-Type: application/json; charset=utf-8');
require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

// Obtener datos enviados (Soporta JSON o $_POST)
$inputData = json_decode(file_get_contents('php://input'), true);

$email = trim($inputData['email'] ?? $_POST['email'] ?? '');
$password = trim($inputData['password'] ?? $_POST['password'] ?? '');

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Por favor, llena todos los campos.']);
    exit;
}

try {
    // Buscar el usuario por email
    $stmt = $conexion->prepare("SELECT id, nombre, email, password FROM usuarios WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $usuario = $stmt->fetch();

    // Verificar si el usuario existe y si la contraseña coincide
    if ($usuario && password_verify($password, $usuario['password'])) {
        
        // Guardar información relevante en la sesión
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nombre'] = $usuario['nombre'];
        $_SESSION['usuario_email'] = $usuario['email'];

        echo json_encode([
            'status' => 'success',
            'message' => 'Inicio de sesión exitoso.',
            'usuario' => [
                'id' => $usuario['id'],
                'nombre' => $usuario['nombre'],
                'email' => $usuario['email']
            ]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Correo o contraseña incorrectos.']);
    }

} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Error al procesar la solicitud: ' . $e->getMessage()
    ]);
}
?>