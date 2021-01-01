all: tilesets maps

tilesets: $(patsubst %.tsx,%.json,$(wildcard *.tsx))
maps: $(patsubst %.tmx,%.json,$(wildcard *.tmx))

%.json: %.tsx
	tiled --export-tileset $< $@

%.json: %.tmx
	tiled --export-map $< $@
