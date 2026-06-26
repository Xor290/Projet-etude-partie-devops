FROM php:8.4-cli

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
        git \
        unzip \
        zip \
        libzip-dev \
        libicu-dev \
        libpq-dev \
        libxml2-dev \
        zlib1g-dev \
        libpng-dev \
        libjpeg-dev \
        libfreetype6-dev \
        libonig-dev \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install -j$(nproc) intl pdo pdo_pgsql xml zip gd mbstring \
 && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Mark the project directory as a safe git directory to avoid "dubious ownership" errors
RUN git config --global --add safe.directory /srv/app || true

WORKDIR /srv/app

# Code source complet d'abord (bin/console requis par les post-scripts Symfony)
COPY . .

# Dépendances Composer
RUN composer install --no-interaction --prefer-dist --no-scripts

# Permissions Symfony
RUN mkdir -p var/cache var/log var/share && chmod -R 777 var/

EXPOSE 8000

CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
