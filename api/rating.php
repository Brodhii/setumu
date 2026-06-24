<?php
/**
 * api/rating.php
 * Backend PHP + SQLite untuk sistem rating Wisata Setumu Dompak
 * Method GET  → ambil semua ulasan + statistik
 * Method POST → simpan ulasan baru (dengan validasi server-side)
 */

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// ── Koneksi SQLite ────────────────────────────────────────────────────────────
$db_path = __DIR__ . '/../db/rating.db';

try {
    $pdo = new PDO('sqlite:' . $db_path);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec('PRAGMA journal_mode=WAL;');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Koneksi database gagal.']);
    exit;
}

// ── Buat tabel jika belum ada ─────────────────────────────────────────────────
$pdo->exec("
    CREATE TABLE IF NOT EXISTS reviews (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        nama     VARCHAR(60) NOT NULL,
        bintang  INTEGER NOT NULL CHECK(bintang BETWEEN 1 AND 5),
        komentar TEXT    NOT NULL,
        tanggal  DATETIME NOT NULL
    )
");

// ── Router ────────────────────────────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    handleGet($pdo);
} elseif ($method === 'POST') {
    handlePost($pdo);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method tidak diizinkan.']);
}

// ── GET: Ambil ulasan + statistik ─────────────────────────────────────────────
function handleGet(PDO $pdo): void
{
    // 5 ulasan terbaru
    $stmt = $pdo->query("SELECT * FROM reviews ORDER BY id DESC LIMIT 5");
    $reviews = $stmt->fetchAll();

    // format tanggal ke bahasa Indonesia
    foreach ($reviews as &$r) {
        $r['tanggal_formatted'] = formatTanggal($r['tanggal']);
    }

    // statistik per bintang
    $stmt2 = $pdo->query("SELECT bintang, COUNT(*) as jumlah FROM reviews GROUP BY bintang");
    $map = [1 => 0, 2 => 0, 3 => 0, 4 => 0, 5 => 0];
    while ($row = $stmt2->fetch()) {
        $map[(int)$row['bintang']] = (int)$row['jumlah'];
    }

    $total = array_sum($map);
    $sum   = 0;
    foreach ($map as $k => $v) $sum += $k * $v;
    $avg   = $total > 0 ? round($sum / $total, 1) : 0;

    echo json_encode([
        'success'  => true,
        'reviews'  => $reviews,
        'stats'    => [
            'map'   => $map,
            'total' => $total,
            'avg'   => $avg,
        ],
    ]);
}

// ── POST: Simpan ulasan baru ──────────────────────────────────────────────────
function handlePost(PDO $pdo): void
{
    // Baca JSON body
    $body = json_decode(file_get_contents('php://input'), true);

    $nama     = trim($body['nama']     ?? '');
    $bintang  = (int)($body['bintang'] ?? 0);
    $komentar = trim($body['komentar'] ?? '');

    // ── Validasi server-side ──────────────────────────────────────────────────
    $errors = [];

    if ($nama === '') {
        $errors['nama'] = 'Nama tidak boleh kosong.';
    } elseif (mb_strlen($nama) < 2) {
        $errors['nama'] = 'Nama minimal 2 karakter.';
    } elseif (mb_strlen($nama) > 60) {
        $errors['nama'] = 'Nama maksimal 60 karakter.';
    } elseif (!preg_match("/^[a-zA-Z0-9\s\-'.]+$/u", $nama)) {
        $errors['nama'] = "Nama hanya boleh huruf, angka, spasi, atau tanda (-'.).";
    }

    if ($bintang < 1 || $bintang > 5) {
        $errors['bintang'] = 'Pilih rating bintang antara 1 sampai 5.';
    }

    if ($komentar === '') {
        $errors['komentar'] = 'Komentar tidak boleh kosong.';
    } elseif (mb_strlen($komentar) < 10) {
        $errors['komentar'] = 'Komentar minimal 10 karakter.';
    } elseif (mb_strlen($komentar) > 500) {
        $errors['komentar'] = 'Komentar maksimal 500 karakter.';
    }

    if (!empty($errors)) {
        http_response_code(422);
        echo json_encode(['success' => false, 'errors' => $errors]);
        return;
    }

    // ── Insert ────────────────────────────────────────────────────────────────
    $tanggal = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare(
        "INSERT INTO reviews (nama, bintang, komentar, tanggal) VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([$nama, $bintang, $komentar, $tanggal]);

    echo json_encode([
        'success' => true,
        'message' => 'Ulasan berhasil disimpan!',
        'id'      => (int)$pdo->lastInsertId(),
    ]);
}

// ── Helper: format tanggal ke bahasa Indonesia ────────────────────────────────
function formatTanggal(string $iso): string
{
    $bulan = [
        1 => 'Januari', 2 => 'Februari', 3 => 'Maret', 4 => 'April',
        5 => 'Mei', 6 => 'Juni', 7 => 'Juli', 8 => 'Agustus',
        9 => 'September', 10 => 'Oktober', 11 => 'November', 12 => 'Desember',
    ];
    $d = new DateTime($iso);
    return $d->format('j') . ' ' . $bulan[(int)$d->format('n')] . ' ' . $d->format('Y');
}
