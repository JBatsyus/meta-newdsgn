<?php

header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["ok" => false, "message" => "method"]);
    exit;
}

$payload = json_decode(file_get_contents("php://input"), true);

if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(["ok" => false, "message" => "invalid json"]);
    exit;
}

$name = trim($payload["name"] ?? "");
$phone = trim($payload["phone"] ?? "");
$country = trim($payload["country"] ?? "");
$website = trim($payload["website"] ?? "");
$consent = !empty($payload["consent"]);

$countries = [
    "Канада",
    "Казахстан",
    "Германия",
    "Польша",
    "Испания",
    "Франция",
    "Италия",
    "Чехия",
    "Великобритания",
    "США",
    "ОАЭ",
];

$phoneOk = preg_match('/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/u', $phone);
$websiteOk = $website === "" || preg_match('/^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/.*)?$/i', $website);

if (mb_strlen($name) < 2 || !$phoneOk || !in_array($country, $countries, true) || !$websiteOk || !$consent) {
    http_response_code(422);
    echo json_encode(["ok" => false, "message" => "validation"]);
    exit;
}

$to = "mail@example.com";
$subject = "Заявка с сайта Meta Ads";
$body = "ФИО: {$name}\nТелефон: {$phone}\nСтрана: {$country}\nСайт: {$website}\n";
$headers = "Content-Type: text/plain; charset=UTF-8\r\n";

// Здесь подключается почтовый агент: mail(), PHPMailer или SMTP.
$sent = mail($to, "=?UTF-8?B?" . base64_encode($subject) . "?=", $body, $headers);

if (!$sent) {
    http_response_code(500);
    echo json_encode(["ok" => false, "message" => "mail"]);
    exit;
}

echo json_encode(["ok" => true]);
