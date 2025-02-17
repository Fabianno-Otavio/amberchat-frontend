import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IPanelInfo } from '../../../../shared/interfaces/panel-info.interface';
import { ISSChannel } from '../../../../shared/interfaces/setup-screen.interface';
import { ISSUSer } from './../../../../shared/interfaces/setup-screen.interface';
import { LoadingComponent } from '../../../../shared/components/loading/loading.component';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { SalesIndicatorsService } from '../../sales-indicators.service';
import { Subject, takeUntil } from 'rxjs';

interface IChannelGroup {
  [key: string]: {
    organization: string;
    orgId: string;
    channels: ISSChannel[];
    disabled: boolean;
  }[];
}

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    LoadingComponent,
    NzDividerModule,
    NzIconModule,
    NzSelectModule,
    NzTableModule,
    ReactiveFormsModule,
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss',
})
export class AdminPanelComponent implements OnInit, OnDestroy {
  private readonly salesIndicatorsService = inject(SalesIndicatorsService);
  private readonly formBuilder = inject(FormBuilder);

  private readonly unsubscribe$ = new Subject();

  public panelInfo!: IPanelInfo;
  public channelGroups: IChannelGroup = {};
  public form!: FormGroup;

  ngOnInit(): void {
    this.getInfo();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(true);
    this.unsubscribe$.unsubscribe();
  }

  private getInfo(): void {
    this.salesIndicatorsService
      .getSetupAdmin()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.panelInfo = res;

          this.panelInfo.users.map((user) => {
            if (!this.channelGroups[user.id]) {
              this.channelGroups[user.id] = [];
            }
            this.panelInfo.channels.map((channel) => {
              const orgName = this.panelInfo.organization.find(
                (o) => o.id === channel.organizationid,
              )?.description;

              if (orgName) {
                let cgIndex = this.channelGroups[user.id]?.findIndex(
                  (cg) => cg.organization === orgName,
                );

                if (cgIndex === -1) {
                  this.channelGroups[user.id]?.push({
                    organization: orgName,
                    orgId: channel.organizationid,
                    channels: [],
                    disabled: false,
                  });
                }

                cgIndex = this.channelGroups[user.id]?.findIndex(
                  (cg) => cg.organization === orgName,
                );

                if (cgIndex !== -1) {
                  this.channelGroups[user.id][cgIndex].channels.push(channel);
                }
              }
            });
          });
          this.buildForm();
          this.getPerms();
        },
      });
  }

  private getPerms(): void {
    this.salesIndicatorsService.getPermissions().subscribe({
      next: (res) => {
        res.perms.map((item: any) => {
          this.form
            .get(item.iduser)
            ?.get('listChannelsAllowed')
            ?.setValue(item.config.channels);
          this.form
            .get(item.iduser)
            ?.get('listOrganizationsAllowed')
            ?.setValue(item.config.organizations);
        });
      },
    });
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({});

    this.panelInfo.users.map((user) => {
      this.form.addControl(
        user.id,
        this.formBuilder.group({
          listChannelsAllowed: [],
          listOrganizationsAllowed: [],
        }),
      );

      this.form
        .get(user.id)
        ?.get('listOrganizationsAllowed')
        ?.valueChanges.subscribe({
          next: () => {
            this.blockOrgSelected(user);
          },
        });
    });
  }

  public blockOrgSelected(user: ISSUSer): void {
    const selectedOrgs = JSON.parse(
      JSON.stringify(
        this.form.get(user.id)?.get('listOrganizationsAllowed')?.value,
      ),
    );

    if (selectedOrgs) {
      selectedOrgs.map((org: string) => {
        const cgIndex = this.channelGroups[user.id]?.findIndex(
          (cg) => cg.orgId === org,
        );

        if (cgIndex !== -1) {
          this.channelGroups[user.id][cgIndex].disabled = true;

          this.channelGroups[user.id][cgIndex].channels.map((c) => {
            let channelsInForm = this.form
              .get(user.id)
              ?.get('listChannelsAllowed')?.value;

            channelsInForm = channelsInForm?.filter(
              (ch: string) => ch !== c.token,
            );

            this.form
              .get(user.id)
              ?.get('listChannelsAllowed')
              ?.patchValue(channelsInForm);
          });
        }
      });
    }

    this.channelGroups[user.id].map((cg, i) => {
      if (
        !selectedOrgs?.includes(cg.orgId) &&
        this.channelGroups[user.id][i].disabled
      ) {
        this.channelGroups[user.id][i].disabled = false;
      }
    });
  }
}
