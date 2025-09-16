<template>
  <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden animate-pulse">
    <!-- Cover image skeleton -->
    <div class="aspect-video bg-gray-200"></div>
    
    <!-- Content skeleton -->
    <div class="p-6">
      <!-- Title -->
      <div class="h-5 bg-gray-200 rounded-lg mb-3"></div>
      
      <!-- Location -->
      <div class="h-4 bg-gray-200 rounded-lg w-2/3 mb-4"></div>
      
      <!-- Stats -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="text-center">
          <div class="h-3 bg-gray-200 rounded mb-2"></div>
          <div class="h-6 bg-gray-200 rounded w-8 mx-auto"></div>
        </div>
        <div class="text-center">
          <div class="h-3 bg-gray-200 rounded mb-2"></div>
          <div class="h-6 bg-gray-200 rounded w-8 mx-auto"></div>
        </div>
      </div>
      
      <!-- Tags -->
      <div class="flex space-x-2 mb-4">
        <div class="h-6 bg-gray-200 rounded w-16"></div>
        <div class="h-6 bg-gray-200 rounded w-20"></div>
        <div class="h-6 bg-gray-200 rounded w-12"></div>
      </div>
      
      <!-- Open hours -->
      <div class="h-4 bg-gray-200 rounded mb-4"></div>
      
      <!-- Managers -->
      <div class="mb-6">
        <div class="h-3 bg-gray-200 rounded w-16 mb-2"></div>
        <div class="flex items-center space-x-2">
          <div class="w-6 h-6 bg-gray-200 rounded-full"></div>
          <div class="w-6 h-6 bg-gray-200 rounded-full -ml-2"></div>
          <div class="h-3 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <div class="flex-1 h-10 bg-gray-200 rounded-xl"></div>
        <div class="w-10 h-10 bg-gray-200 rounded-xl"></div>
        <div class="w-10 h-10 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  </div>
</template>