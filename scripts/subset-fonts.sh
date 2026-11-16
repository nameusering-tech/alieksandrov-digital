#!/bin/sh
# Erzeugt die schlanken Schriftdateien in src/assets/fonts/ aus den Fontsource-Paketen.
# Entfernt Hinting und alle Zeichen, die die Website nicht braucht.
# Voraussetzung: pip install fonttools brotli   (liefert pyftsubset)
# Aufruf: sh scripts/subset-fonts.sh
set -e
SRC=node_modules/@fontsource
OUT=src/assets/fonts
mkdir -p "$OUT"

# Lateinisch (Deutsch): ASCII, Latin-1, typografische Zeichen, Euro, Pfeile
LATIN="U+0020-007E,U+00A0-00FF,U+2010-2015,U+2018-201E,U+2022,U+2026,U+2032-2033,U+20AC,U+2116,U+2190-2193,U+2212"
# Ukrainisch: Kyrillisch (inkl. Ґ ґ Є є І і Ї ї), Betonungszeichen
CYR="U+0301,U+0400-045F,U+0490-0491"

sub() { # quelle ziel unicodes
  pyftsubset "$SRC/$1" --unicodes="$3" --output-file="$OUT/$2" --flavor=woff2 \
    --no-hinting --desubroutinize --layout-features='kern,liga,calt,locl,tnum,lnum' --name-IDs='' --drop-tables+=DSIG
}
sub barlow-condensed/files/barlow-condensed-latin-600-normal.woff2 barlow-condensed-600-latin.woff2 "$LATIN"
sub oswald/files/oswald-latin-600-normal.woff2 oswald-600-latin.woff2 "$LATIN"
sub oswald/files/oswald-cyrillic-600-normal.woff2 oswald-600-cyrillic.woff2 "$CYR"
sub pt-sans/files/pt-sans-latin-400-normal.woff2 pt-sans-400-latin.woff2 "$LATIN"
sub pt-sans/files/pt-sans-latin-700-normal.woff2 pt-sans-700-latin.woff2 "$LATIN"
sub pt-sans/files/pt-sans-cyrillic-400-normal.woff2 pt-sans-400-cyrillic.woff2 "$CYR"
sub pt-sans/files/pt-sans-cyrillic-700-normal.woff2 pt-sans-700-cyrillic.woff2 "$CYR"
# VT323 nur für Zahlen und Zeichen wie + / >_
sub vt323/files/vt323-latin-400-normal.woff2 vt323-400.woff2 "U+0020-007E"
ls -l "$OUT"
