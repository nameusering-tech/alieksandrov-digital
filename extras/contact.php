<?php
// Versand des Kontaktformulars. Benötigt PHP mit mail() auf dem Server (siehe README.md und TODO.md).
// Ohne diesen Endpunkt fällt das Formular automatisch auf mailto: zurück.
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const RECIPIENT = 'alieksandrov.arbeit@gmail.com';
const SENDER = 'noreply@alieksandrov-digital.de'; // TODO [..]: existierendes Postfach der Domain eintragen

function out(int $code, bool $ok): never {
    http_response_code($code);
    echo json_encode(['ok' => $ok]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') out(405, false);
if (!empty($_POST['website'])) out(200, true); // Honeypot: Bots bekommen eine Erfolgsmeldung

$name = trim((string)($_POST['name'] ?? ''));
$email = trim((string)($_POST['email'] ?? ''));
$message = trim((string)($_POST['message'] ?? ''));
$consent = ($_POST['consent'] ?? '') === '1';

if ($name === '' || $message === '' || !$consent) out(422, false);
if (mb_strlen($name) > 120 || mb_strlen($message) > 4000) out(422, false);
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/[\r\n]/', $email . $name)) out(422, false);

$subject = '=?UTF-8?B?' . base64_encode('Anfrage über alieksandrov-digital.de von ' . $name) . '?=';
$body = "Name: $name\nE-Mail: $email\n\n$message\n";
$headers = [
    'From: ' . SENDER,
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];

$sent = mail(RECIPIENT, $subject, $body, implode("\r\n", $headers));
out($sent ? 200 : 500, $sent);
