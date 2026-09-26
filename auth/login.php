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

$email = trim($inputData['correo'] ?? $_POST['correo'] ?? '');
$password = trim($inputData['contra'] ?? $_POST['contra'] ?? '');

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Por favor, llena todos los campos.']);
    exit;
}

try {
    // Buscar el usuario por email (incluyendo rol, foto y datos de contacto)
    $stmt = $conexion->prepare("SELECT id_usuario, nombre, email, password, rol, foto_perfil, departamento, distrito, telefono FROM usuario WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $usuario = $stmt->fetch();

    // Verificar si el usuario existe y si la contraseña coincide
    if ($usuario && password_verify($password, $usuario['password'])) {
        
        // Guardar información relevante en la sesión
        $_SESSION['usuario_id'] = $usuario['id_usuario'];
        $_SESSION['usuario_nombre'] = $usuario['nombre'];
        $_SESSION['usuario_email'] = $usuario['email'];
        $_SESSION['usuario_rol'] = $usuario['rol'];
        $_SESSION['usuario_foto_perfil'] = $usuario['foto_perfil'];
        $_SESSION['usuario_departamento'] = $usuario['departamento'];
        $_SESSION['usuario_distrito'] = $usuario['distrito'];
        $_SESSION['usuario_telefono'] = $usuario['telefono'];

        echo json_encode([
            'status' => 'success',
            'message' => 'Inicio de sesión exitoso.',
            'usuario' => [
                'id_usuario' => $usuario['id_usuario'],
                'nombre' => $usuario['nombre'],
                'email' => $usuario['email'],
                'rol' => $usuario['rol'],
                'foto_perfil' => $usuario['foto_perfil'],
                'departamento' => $usuario['departamento'],
                'distrito' => $usuario['distrito'],
                'telefono' => $usuario['telefono']
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