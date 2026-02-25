#!/bin/bash

case "$1" in
  dev)
    docker compose up --build
    ;;
  down)
    docker compose down
    ;;
  clean)
    docker compose down -v --rmi local
    ;;
  seed-demo)
    docker compose exec backend npm run db:seed:demo
    ;;
  *)
    echo "Usage: ./run.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev         Start development environment"
    echo "  down        Stop all containers"
    echo "  clean       Remove containers, volumes, and images"
    echo "  seed-demo   Seed demo data"
    ;;
esac
