import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, PanelMenuModule],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class SidebarComponent {
    @Input() model: MenuItem[] = [];
}
