import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full min-h-[80vh] text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100 mx-4 my-2">
      <div class="relative mb-6">
        <div class="w-40 h-40 bg-[#FDF4FF] rounded-full flex items-center justify-center relative">
          <!-- Simplified Icon -->
          <svg class="w-20 h-20 text-[#802b74]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <div class="absolute inset-0 rounded-full border-2 border-[#802b74] border-dashed animate-[spin_10s_linear_infinite] opacity-20"></div>
        </div>
      </div>

      <h1 class="text-4xl md:text-5xl font-bold text-[#111827] mb-4">
        Coming <span class="text-[#802b74]">Soon</span>
      </h1>
      
      <p class="text-[16px] text-[#6B7280] max-w-md mx-auto leading-relaxed">
        This section is under development. We are working hard to bring you new features and a better experience.
      </p>

      <div class="mt-8 flex items-center justify-center gap-2">
        <span class="w-2 h-2 rounded-full bg-[#802b74]"></span>
        <span class="w-2 h-2 rounded-full bg-[#802b74] opacity-40"></span>
        <span class="w-2 h-2 rounded-full bg-[#802b74] opacity-20"></span>
      </div>
    </div>
  `
})
export class ComingSoonComponent { }
