<template>
  <div class="custom-social-links">
    <a href="https://github.com/DaSchTour/dasch-ng" target="_blank" rel="noopener noreferrer" aria-label="GitHub Repository" class="social-link">
      <i class="fa-brands fa-github"></i>
    </a>
    <a href="https://daniel-schuba.de" target="_blank" rel="noopener noreferrer" aria-label="Daniel Schuba Website" class="social-link">
      <i class="fa-slab fa-globe"></i>
    </a>
  </div>
</template>

<style scoped>
.custom-social-links {
  display: flex;
  align-items: center;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
}

.social-link:hover {
  color: var(--vp-c-text-1);
}

.social-link i {
  font-size: 20px;
}
</style>
