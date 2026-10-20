import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnComments1781897583580 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // =============================================
    // TABLE: user
    // =============================================
    await queryRunner.query(`COMMENT ON TABLE "user" IS 'Registered users of the application'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."id" IS 'Auto-incremented primary key'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."rut" IS 'Chilean national identification number (RUT)'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."firstName" IS 'User first name'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."lastName" IS 'User last name'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."email" IS 'Email address of the user, must be unique'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."emailVerified" IS 'Whether the user email has been verified'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."password" IS 'Hashed password for local authentication'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."order" IS 'Display order for sorting purposes'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."visible" IS 'Whether the user is visible in listings'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."enabled" IS 'Whether the user account is active'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."comment" IS 'Administrative notes about the user'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."lastLoginDate" IS 'Timestamp of the most recent successful login'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."lastLoginIp" IS 'IP address of the last login'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."lastPasswordUpdate" IS 'Timestamp of the last password change'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."lastFailLogDate" IS 'Timestamp of the last failed login attempt'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."timeZoneCode" IS 'IANA timezone identifier for the user'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."languageCode" IS 'ISO 639-1 language code for UI localization'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."resetPasswordToken" IS 'Token used for password reset flow'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."resetPasswordDate" IS 'Expiration timestamp for the password reset token'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."failedLoginAttempts" IS 'Counter for consecutive failed login attempts'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."logout" IS 'Whether the user has been forcefully logged out'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."authProvider" IS 'Authentication provider name (e.g. local, google, azure)'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."phone" IS 'User phone number'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."token" IS 'Internal unique token generated on user creation'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."tokenExpiration" IS 'Expiration timestamp for the internal token'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."img" IS 'URL or path to the user profile image'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."enable2fa" IS 'Whether two-factor authentication is enabled'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."secret2fa" IS 'TOTP secret key for two-factor authentication'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."sessionToken" IS 'Current active session token for the user'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."iata" IS 'IATA airport code associated with the user'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."createdAt" IS 'Timestamp when the record was created'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."updatedAt" IS 'Timestamp when the record was last updated'`);
    await queryRunner.query(`COMMENT ON COLUMN "user"."deletedAt" IS 'Soft delete timestamp, NULL if active'`);

    // =============================================
    // TABLE: profile
    // =============================================
    await queryRunner.query(`COMMENT ON TABLE "profile" IS 'Authorization profiles that group roles for users'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."id" IS 'Auto-incremented primary key'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."title" IS 'Display name of the profile'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."code" IS 'Unique code identifier for the profile'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."description" IS 'Brief description of the profile purpose'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."enabled" IS 'Whether the profile is active'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."order" IS 'Display order for sorting purposes'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."visible" IS 'Whether the profile is visible in listings'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."createdAt" IS 'Timestamp when the record was created'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."updatedAt" IS 'Timestamp when the record was last updated'`);
    await queryRunner.query(`COMMENT ON COLUMN "profile"."deletedAt" IS 'Soft delete timestamp, NULL if active'`);

    // =============================================
    // TABLE: role
    // =============================================
    await queryRunner.query(`COMMENT ON TABLE "role" IS 'Granular permissions or capabilities assignable to profiles'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."id" IS 'Auto-incremented primary key'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."title" IS 'Display name of the role'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."code" IS 'Unique code identifier for the role'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."description" IS 'Brief description of the role purpose'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."enabled" IS 'Whether the role is active'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."order" IS 'Display order for sorting purposes'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."visible" IS 'Whether the role is visible in listings'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."createdAt" IS 'Timestamp when the record was created'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."updatedAt" IS 'Timestamp when the record was last updated'`);
    await queryRunner.query(`COMMENT ON COLUMN "role"."deletedAt" IS 'Soft delete timestamp, NULL if active'`);

    // =============================================
    // TABLE: userProfile
    // =============================================
    await queryRunner.query(`COMMENT ON TABLE "userProfile" IS 'Join table linking users to their assigned profiles (many-to-many)'`);
    await queryRunner.query(`COMMENT ON COLUMN "userProfile"."id" IS 'Auto-incremented primary key'`);
    await queryRunner.query(`COMMENT ON COLUMN "userProfile"."userId" IS 'FK to user.id'`);
    await queryRunner.query(`COMMENT ON COLUMN "userProfile"."profileId" IS 'FK to profile.id'`);
    await queryRunner.query(`COMMENT ON COLUMN "userProfile"."createdAt" IS 'Timestamp when the record was created'`);
    await queryRunner.query(`COMMENT ON COLUMN "userProfile"."updatedAt" IS 'Timestamp when the record was last updated'`);
    await queryRunner.query(`COMMENT ON COLUMN "userProfile"."deletedAt" IS 'Soft delete timestamp, NULL if active'`);

    // =============================================
    // TABLE: profileRole
    // =============================================
    await queryRunner.query(`COMMENT ON TABLE "profileRole" IS 'Join table linking profiles to their assigned roles (many-to-many)'`);
    await queryRunner.query(`COMMENT ON COLUMN "profileRole"."id" IS 'Auto-incremented primary key'`);
    await queryRunner.query(`COMMENT ON COLUMN "profileRole"."profileId" IS 'FK to profile.id'`);
    await queryRunner.query(`COMMENT ON COLUMN "profileRole"."roleId" IS 'FK to role.id'`);
    await queryRunner.query(`COMMENT ON COLUMN "profileRole"."createdAt" IS 'Timestamp when the record was created'`);
    await queryRunner.query(`COMMENT ON COLUMN "profileRole"."updatedAt" IS 'Timestamp when the record was last updated'`);
    await queryRunner.query(`COMMENT ON COLUMN "profileRole"."deletedAt" IS 'Soft delete timestamp, NULL if active'`);

    // =============================================
    // TABLE: param
    // =============================================
    await queryRunner.query(`COMMENT ON TABLE "param" IS 'Configurable parameters organized in a hierarchical tree structure'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."id" IS 'Auto-incremented primary key'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."title" IS 'Display name of the parameter'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."code" IS 'Unique code identifier within its type'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."description" IS 'Brief description of the parameter'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."type" IS 'Category or group type of the parameter'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."subType" IS 'Sub-category within the parameter type'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."externalCode" IS 'Code used for integration with external systems'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."value" IS 'Stored value of the parameter'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."enabled" IS 'Whether the parameter is active'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."visible" IS 'Whether the parameter is visible in listings'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."order" IS 'Display order for sorting purposes'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."parentId" IS 'FK to param.id, references the parent parameter in the hierarchy'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "param"."customProperties" IS 'JSONB. Additional custom key-value properties. Free-form (Record<string, unknown>), structure varies per parameter type.'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "param"."createdAt" IS 'Timestamp when the record was created'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."updatedAt" IS 'Timestamp when the record was last updated'`);
    await queryRunner.query(`COMMENT ON COLUMN "param"."deletedAt" IS 'Soft delete timestamp, NULL if active'`);

    // =============================================
    // TABLE: messages
    // =============================================
    await queryRunner.query(`COMMENT ON TABLE "messages" IS 'System messages and notifications sent to users'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."id" IS 'Auto-incremented primary key'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."receiver" IS 'Recipient identifier (email, user ID, or group)'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."type" IS 'Message channel type (e.g. email, sms, push)'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."title" IS 'Subject or title of the message'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."message" IS 'Full message body content'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."publicationDate" IS 'Scheduled start date for message visibility'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."publicationFinish" IS 'Scheduled end date for message visibility'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."createdAt" IS 'Timestamp when the record was created'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."updatedAt" IS 'Timestamp when the record was last updated'`);
    await queryRunner.query(`COMMENT ON COLUMN "messages"."deletedAt" IS 'Soft delete timestamp, NULL if active'`);

    // =============================================
    // TABLE: auditorLog
    // =============================================
    await queryRunner.query(`COMMENT ON TABLE "auditorLog" IS 'Audit trail recording user actions and system events'`);
    await queryRunner.query(`COMMENT ON COLUMN "auditorLog"."id" IS 'Auto-incremented primary key'`);
    await queryRunner.query(`COMMENT ON COLUMN "auditorLog"."emailUser" IS 'Email address of the user who performed the action'`);
    await queryRunner.query(`COMMENT ON COLUMN "auditorLog"."ip" IS 'IP address from which the action was performed'`);
    await queryRunner.query(`COMMENT ON COLUMN "auditorLog"."type" IS 'Category of the audited action (e.g. login, crud, export)'`);
    await queryRunner.query(`COMMENT ON COLUMN "auditorLog"."description" IS 'Human-readable description of the audited action'`);
    await queryRunner.query(
      `COMMENT ON COLUMN "auditorLog"."dataJson" IS 'JSONB. Additional audit data. Free-form (Record<string, unknown>), typically contains before/after values, request params and affected entities.'`,
    );
    await queryRunner.query(`COMMENT ON COLUMN "auditorLog"."createdAt" IS 'Timestamp when the record was created'`);
    await queryRunner.query(`COMMENT ON COLUMN "auditorLog"."updatedAt" IS 'Timestamp when the record was last updated'`);
    await queryRunner.query(`COMMENT ON COLUMN "auditorLog"."deletedAt" IS 'Soft delete timestamp, NULL if active'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['user', 'profile', 'role', 'userProfile', 'profileRole', 'param', 'messages', 'auditorLog'];
    for (const table of tables) {
      await queryRunner.query(`COMMENT ON TABLE "${table}" IS NULL`);
      const columns = await queryRunner.query(`SELECT column_name FROM information_schema.columns WHERE table_name = $1`, [table]);
      for (const col of columns) {
        await queryRunner.query(`COMMENT ON COLUMN "${table}"."${col.column_name}" IS NULL`);
      }
    }
  }
}
