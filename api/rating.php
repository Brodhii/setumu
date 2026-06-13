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
        nama     TEXT    NOT NULL,
        bintang  INTEGER NOT NULL CHECK(bintang BETWEEN 1 AND 5),
        komentar TEXT    NOT NULL,
        tanggal  TEXT    NOT NULL
    )
");

// Tabel untuk rate limiting berbasis IP
$pdo->exec("
    CREATE TABLE IF NOT EXISTS rate_limits (
        ip         TEXT PRIMARY KEY,
        last_submit TEXT NOT NULL
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
    // ── Rate Limiting: 1 ulasan per IP setiap 5 menit ────────────────────────
    $cooldown = 300; // detik (5 menit)
    $ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';

    $stmtRL = $pdo->prepare("SELECT last_submit FROM rate_limits WHERE ip = ?");
    $stmtRL->execute([$ip]);
    $lastSubmit = $stmtRL->fetchColumn();

    if ($lastSubmit !== false) {
        $elapsed = time() - strtotime($lastSubmit);
        if ($elapsed < $cooldown) {
            $sisa = ceil(($cooldown - $elapsed) / 60);
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'message' => "Terlalu cepat. Silakan coba lagi dalam {$sisa} menit.",
            ]);
            return;
        }
    }

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

    // ── Catat timestamp rate limit untuk IP ini ───────────────────────────────
    $stmtUpsert = $pdo->prepare(
        "INSERT OR REPLACE INTO rate_limits (ip, last_submit) VALUES (?, ?)"
    );
    $stmtUpsert->execute([$ip, $tanggal]);

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
