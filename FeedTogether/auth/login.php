<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
   require_once '../config/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Método no permitido.']);
    exit;
}

$inputData = json_decode(file_get_contents('php://input'), true);
$email = trim($inputData['email'] ?? $_POST['email'] ?? '');
$password = trim($inputData['password'] ?? $_POST['password'] ?? '');

if (empty($email) || empty($password)) {
    echo json_encode(['status' => 'error', 'message' => 'Por favor, llena todos los campos.']);
    exit;
}

try {
    // Corregido: tabla "usuario" (no "usuarios"), y agregue el rol
    $stmt = $conexion->prepare("SELECT id_usuario, nombre, email, password, rol, foto_perfil FROM usuario WHERE email = :email");
    $stmt->execute([':email' => $email]);
    $usuario = $stmt->fetch();

    if ($usuario && password_verify($password, $usuario['password'])) {
        session_regenerate_id(true); 

        $_SESSION['usuario_id']     = $usuario['id_usuario'];
        $_SESSION['usuario_nombre'] = $usuario['nombre'];
        $_SESSION['usuario_email']  = $usuario['email'];
        $_SESSION['usuario_rol']    = $usuario['rol'];     
        $_SESSION['usuario_foto']   = $usuario['foto_perfil'];

        echo json_encode([
            'status' => 'success',
            'message' => 'Inicio de sesión exitoso.',
            'usuario' => [
                'id' => $usuario['id_usuario'],
                'nombre' => $usuario['nombre'],
                'email' => $usuario['email'],
                'rol' => $usuario['rol']
            ]
        ]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Correo o contraseña incorrectos.']);
    }
} catch (PDOException $e) {
    error_log('Error login: ' . $e->getMessage());
    echo json_encode(['status' => 'error', 'message' => 'Error al procesar la solicitud.']);
}