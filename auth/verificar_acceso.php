<?php
header("Content-Type: application/json; charset=UTF-8");
 
session_start();
 
if (!isset($_SESSION['id_usuario'])) {
    echo json_encode([
        "success" => false,
        "message" => "Acceso no autorizado. Debe iniciar sesión."
    ]);
    exit;
}
 
echo json_encode([
    "success" => true,
    "message" => "Acceso permitido."
]);