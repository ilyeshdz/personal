---
title: yaml-parser
description: A YAML parser I started to learn Odin, and still pick up from time to time.
date: 2026-07-14
language: Odin
source: https://github.com/ilyeshdz/yaml-parser
stack:
  - Parsers
  - CLI
---

A small YAML parser, and a command line tool around it, written in Odin.

I started it because I wanted to learn a language I knew nothing about, with
nothing to lean on, so I would have to understand every layer myself: bytes to
tokens, tokens to a tree, tree back to text. That was the point, more than the
parser.

It is not meant to be a serious tool. It covers the subset of YAML I happen to
need, it is not trying to be complete, and I am not optimising it. I come back
to it when I have time, usually to add one small thing, and I expect that to
carry on for a while.

## What it handles

Block mappings and sequences, comments, document markers, and plain, single
quoted and double quoted scalars, with integers, floats, booleans and null typed
on the way in.

## Command line

```bash
yaml-parser get config.yaml services.api.port
yaml-parser set config.yaml services.api.port 8080
```

Key paths are dotted, and the exit code tells a script whether it found
something.
