import { Global, Module } from "@nestjs/common";
import { ClerkAuthGuard } from "src/common/guard/clerk-auth.guard";
import { ClerkProvider } from "src/common/providers/clerk.provider";
import { AuthService } from "./auth.service";
import { UsersModule } from "src/users/users.module";

@Global()
@Module({
  imports: [UsersModule],
  providers: [
    AuthService,
    ClerkProvider, // This provides 'CLERK_CLIENT'
    ClerkAuthGuard,
  ],
  exports: [
    AuthService,    // Export this
    ClerkProvider,  // Export this so 'CLERK_CLIENT' is visible
    ClerkAuthGuard,
  ],
})
export class AuthModule { }
